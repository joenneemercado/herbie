import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { VtexModule } from './vtex/vtex.module';
import { OpahModule } from './opah/opah.module';
import { ZeusModule } from './zeus/zeus.module';
import { LojaModule } from './loja/loja.module';
import { WifiModule } from './wifi/wifi.module';
import { ConnectorsController } from './connectors.controller';
import { DatabaseModule } from '@src/database/database.module';
import { AiModule } from './ai/ai.module';
import { InvioModule } from './invio/invio.module';

@Module({
  controllers: [ConnectorsController],
  providers: [ConnectorsService],
  imports: [
    VtexModule,
    OpahModule,
    ZeusModule,
    LojaModule,
    WifiModule,
    DatabaseModule,
    AiModule,
    InvioModule,
  ],
})
export class ConnectorsModule {}
