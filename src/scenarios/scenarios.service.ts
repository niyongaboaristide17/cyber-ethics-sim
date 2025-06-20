import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Scenario, ScenarioDocument } from './schemas/scenario.schema';
import { Model } from 'mongoose';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectModel(Scenario.name) private scenarioModel: Model<ScenarioDocument>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(dto: CreateScenarioDto) {
    const created = await this.scenarioModel.create(dto);
    return created;
  }

  async findAll(filters: {
    search?: string;
    category?: string;
    tags?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.tags) query.tags = { $in: filters.tags.split(',') };

    // If search term is provided, try Elasticsearch first
    if (filters.search) {
      try {
        const result = await this.elasticsearchService.search({
          index: 'scenarios',
          query: {
            multi_match: {
              query: filters.search,
              fields: ['title', 'description', 'context'],
              fuzziness: 'AUTO', // This enables typo correction
            },
          },
          from: skip,
          size: limit,
        });

        const elasticHits = result.hits.hits;
        const ids = elasticHits.map((hit) => hit._id);

        // Get full MongoDB documents that match those Elasticsearch IDs
        const mongoResults = await this.scenarioModel
          .find({ ...query, _id: { $in: ids } })
          .exec();

        return mongoResults;
      } catch (error) {
        console.error('Elasticsearch search failed:', error.message);
        // Fall back to Mongo search methods below
      }

      // MongoDB full-text fallback
      const textResults = await this.scenarioModel
        .find(
          { ...query, $text: { $search: filters.search } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec();

      if (textResults.length > 0) return textResults;

      // Regex fuzzy fallback
      const fuzzyRegex = new RegExp(filters.search, 'i');

      return this.scenarioModel
        .find({
          ...query,
          $or: [
            { title: { $regex: fuzzyRegex } },
            { description: { $regex: fuzzyRegex } },
            { context: { $regex: fuzzyRegex } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    // If no search, return based on filter only
    return this.scenarioModel.find(query).skip(skip).limit(limit).exec();
  }
}
