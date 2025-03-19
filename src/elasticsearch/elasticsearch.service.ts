import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async indexDocument(index: string, id: string, document: any) {
    return this.elasticsearchService.index({
      index,
      id,
      document,
    });
  }

  async search(index: string, query: any) {
    return this.elasticsearchService.search({
      index,
      ...query,
    });
  }

  async deleteDocument(index: string, id: string) {
    return this.elasticsearchService.delete({
      index,
      id,
    });
  }

  async updateDocument(index: string, id: string, document: any) {
    return this.elasticsearchService.update({
      index,
      id,
      doc: document,
    });
  }
} 