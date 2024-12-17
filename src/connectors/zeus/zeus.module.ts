import { Module } from '@nestjs/common';
import { ZeusService } from './zeus.service';
import { ZeusController } from './zeus.controller';

@Module({
  controllers: [ZeusController],
  providers: [ZeusService],
})
export class ZeusModule {}
