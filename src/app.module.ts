import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ValidatorsModule } from './common/validators/validators.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommentModule } from './comment/comment.module';
import { WebSocketModule } from './web-socket/web-socket.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        cloudName: configService.get<string>('CLOUD_NAME'),
        apiKey: configService.get<string>('API_KEY'),
        apiSecret: configService.get<string>('API_SECRET'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DATABASE_TYPE') as any,
        host: configService.get<string>('DATABASE_HOST'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        synchronize: true,
        logging: configService.get<string>('LOGGING_SQL') === 'true',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    PostModule,
    CommentModule,
    ValidatorsModule,
    WebSocketModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
