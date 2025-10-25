import { Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlacesModule } from './places/places.module';
import { Place } from './places/entities/place.entity';
import { User } from './users/entities/user.entity';
import { Review } from './places/entities/review.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocsModule } from './docs/docs.module';
import configuration from './config/configuration';
import { HttpResponseInterceptor } from './common/interceptors/http-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [Place, User, Review],
        synchronize: true, // ⚠️ hanya untuk dev! auto sync schema
      }),
    }),
    AuthModule,
    UsersModule,
    PlacesModule,
    DocsModule,
  ],
})
export class AppModule {}
