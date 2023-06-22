import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface PostPayload {
  postId: number;
}

interface CommentPayload {
  postId: number;
  comment: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'post',
})
export class PostGateway {
  @SubscribeMessage('post')
  handlePost(client: Socket, data: PostPayload) {
    client.join(`post:${data.postId}`);
  }

  @SubscribeMessage('comment')
  handleComment(client: Socket, data: CommentPayload) {
    client.to(`post:${data.postId}`).emit('comment', data);
  }
}
