import { Module } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';

@Module({
  imports: [],
  controllers: [ScenariosController],
  providers: [ScenariosService],
})
export class ScenariosModule {}
