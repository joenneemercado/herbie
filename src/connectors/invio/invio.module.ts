import { Module } from '@nestjs/common';
import { InvioService } from './invio.service';
import { InvioController } from './invio.controller';

@Module({
  controllers: [InvioController],
  providers: [InvioService],
})
export class InvioModule {}
