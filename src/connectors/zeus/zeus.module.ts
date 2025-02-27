import { Module } from '@nestjs/common';
import { ZeusService } from './zeus.service';
import { ZeusController } from './zeus.controller';
import { DatabaseModule } from '@src/database/database.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[DatabaseModule],
  controllers: [ZeusController],
  providers: [ZeusService,JwtService],
})
export class ZeusModule {}
