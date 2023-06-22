import { Module } from '@nestjs/common';
import { PostGateway } from './post.gateway';

@Module({
  providers: [PostGateway],
})
export class WebSocketModule {}
