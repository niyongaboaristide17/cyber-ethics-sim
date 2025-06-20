import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Type } from 'class-transformer';

export type ScenarioDocument = HydratedDocument<Scenario>;

@Schema({ _id: false })
export class Decision {
  @Prop() optionText: string;
  @Prop() legalInsight: string;
  @Prop() ethicalInsight: string;
}
export const DecisionSchema = SchemaFactory.createForClass(Decision);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Scenario {
  @Prop() title: string;
  @Prop() description: string;
  @Prop() context: string;

  @Prop({ type: [DecisionSchema] })
  @Type(() => Decision)
  decisions: Decision[];

  @Prop() tags: string[];
  @Prop() category: string;
  @Prop() difficulty: string;
  @Prop() language: string;
  @Prop() region: string;

  @Prop() createdBy: string;
  @Prop() isAIgenerated: boolean;
  @Prop({ default: false }) published: boolean;
  @Prop({ default: false }) isFeatured: boolean;
  @Prop({ default: true }) editable: boolean;
  @Prop({ default: 0 }) views: number;
  @Prop({ default: 0 }) likes: number;
  @Prop() publishedAt: Date;
  @Prop() educatorNotes: string;

  @Prop() sourceHeadline: string;
  @Prop() sourceUrl: string;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
ScenarioSchema.index({ tags: 1 });
ScenarioSchema.index({ category: 1 });
ScenarioSchema.index({ title: 'text', description: 'text', context: 'text' });
