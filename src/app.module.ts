import {
  Module,
  Injectable,
  ExecutionContext,
  ContextType,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { InteractionsModule } from './interactions/interactions.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './auth/auth.module';
import { QueueModule } from './queue/queue.module';
import { ImportModule } from './import/import.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConnectorsModule } from './connectors/connectors.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AudiencesModule } from './campaigns/audiences/audiences.module';
import { TagsModule } from './tags/tags.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SourceModule } from './source/source.module';
import { ChannelsModule } from './channels/channels.module';
import { EventsModule } from './events/events.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { SellerModule } from './seller/seller.module';
import { InvioModule } from './connectors/invio/invio.module';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  // Este método é chamado pelo `handleRequest` da classe pai (`ThrottlerGuard`).
  // O `handleRequest` da classe pai já processou o `ExecutionContext`
  // e extraiu o objeto de requisição (`req` para HTTP, `client` para WS, etc.).
  // É esse objeto de requisição extraído que é passado como argumento para `getTracker`.
  protected async getTracker(req: any): Promise<string> {
    // O parâmetro é `req` (ou similar), NÃO `ExecutionContext`
    // Se o objeto `req` tiver uma propriedade `user` com um `id` (típico após autenticação bem-sucedida)
    if (req.user?.id) {
      return `user-${req.user.id}`;
    }

    // Se `req.user.id` não existir (ex: requisição de um usuário não autenticado,
    // ou o contexto não é HTTP e não popula `req.user`),
    // então recorremos ao comportamento padrão do `ThrottlerGuard`.
    // O `super.getTracker(req)` por padrão tentará usar `req.ip` para HTTP.
    // Para outros tipos de contexto (WS, RPC), ele pode ter outros fallbacks ou retornar um tracker menos específico.
    return super.getTracker(req);
  }
}

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost', // ou o host do seu Redis
        port: process.env.REDIS_PORT || 6379,
        ttl: 0, // TTL padrão (pode ser sobrescrito com { ttl } na chamada)
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(),
    MulterModule.register({
      dest: process.env.UPLOAD_DIR,
    }),
    CustomersModule,
    OrdersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    OrganizationsModule,
    UsersModule,
    InteractionsModule,
    AuthModule,
    QueueModule,
    ImportModule,
    ConnectorsModule,
    DashboardModule,
    CampaignsModule,
    AudiencesModule,
    TagsModule,
    SourceModule,
    ChannelsModule,
    EventsModule,
    SellerModule,
    InvioModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //PrismaService,
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard, // Throttler por usuário
    },
  ],
})
export class AppModule {}
