import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit {
  private client: ClientKafka;

  constructor(private configService: ConfigService) {
    this.client = new ClientKafka({
      client: {
        clientId: this.configService.get('kafka.clientId'),
        brokers: this.configService.get('kafka.brokers') as string[],
      }
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async emit(topic: string, message: any) {
    return this.client.emit(topic, message);
  }

  async send(topic: string, message: any) {
    return this.client.send(topic, message);
  }
} 