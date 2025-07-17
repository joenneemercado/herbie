import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MailgridService } from './mailgrid.service';
import { MailgridController } from './mailgrid.controller';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [MailgridService],
  controllers: [MailgridController],
  exports: [MailgridService],
})
export class MailgridModule {}