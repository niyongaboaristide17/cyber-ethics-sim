import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import * as process from 'process';

@Global()
@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: undefined,
      tls: {
        rejectUnauthorized: process.env.ELASTICSEARCH_TLS === 'true',
      },
    }),
  ],
  exports: [ElasticsearchModule],
})
export class ElasticModule {}
