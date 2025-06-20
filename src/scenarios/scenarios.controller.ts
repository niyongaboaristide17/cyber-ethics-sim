import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ScenariosService } from './scenarios.service';
import { Public } from '../common/decorators/auth.decorator';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new scenario' })
  @ApiResponse({ status: 201, description: 'Scenario created successfully.' })
  create(@Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(createScenarioDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all scenarios (with optional filters & pagination)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Full-text search query',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  getAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.scenariosService.findAll({
      search,
      category,
      tags,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
