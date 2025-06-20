import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Scenario, ScenarioSchema } from '../scenarios/schemas/scenario.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): { uri: string } => ({
        uri:
          config.get<string>('MONGO_URI') ??
          'mongodb://localhost:27017/nestjs_starter',
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Scenario.name, schema: ScenarioSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
