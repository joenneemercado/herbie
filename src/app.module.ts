import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 3,
        },
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Aplica o rate limit globalmente
    },
  ],
})
export class AppModule {}
