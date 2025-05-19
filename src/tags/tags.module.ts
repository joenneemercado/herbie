import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { DatabaseModule } from '@src/database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TagsController],
  providers: [TagsService, JwtService],
  exports: [TagsService],
  imports: [DatabaseModule],
})
export class TagsModule {}
