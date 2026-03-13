import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as unknown as { token?: string };
      const query = client.handshake.query as unknown as { token?: string };
      const token = auth.token || query.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET') || '';
      const payload = (await this.jwtService.verifyAsync(token, {
        secret,
      })) as unknown;

      if (
        payload &&
        typeof payload === 'object' &&
        'sub' in payload &&
        typeof payload.sub === 'string'
      ) {
        const userId = payload.sub;
        await client.join(`user_${userId}`);
        this.logger.log(`Client connecté : ${client.id} (User: ${userId})`);
      } else {
        this.logger.error('Payload JWT invalide');
        client.disconnect();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erreur de connexion WebSocket : ${errorMessage}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
