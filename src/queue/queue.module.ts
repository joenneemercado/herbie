import {
  forwardRef,
  INestApplication,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ImportProcessor } from './import.processor';
import { ImportModule } from '@src/import/import.module';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { VtexProcessor } from './vtex.processor';
import { VtexModule } from '@src/connectors/vtex/vtex.module';
import { WifiModule } from '@src/connectors/wifi/wifi.module';
import { WifiProcessor } from './wifi.processor';
import { OpahModule } from '@src/connectors/opah/opah.module';
import { OpahProcessor } from './opah.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'friday.redis.cache.windows.net',
        port: 6380,
        tls: {},
        password: process.env.BULL_PASSWORD,
        db: 0,
        maxRetriesPerRequest: 2,
        connectTimeout: 10000,
      },
    }),
    BullModule.registerQueue({
      name: 'import-queue',
    }),
    BullModule.registerQueue({
      name: 'vtex-queue',
    }),
    BullModule.registerQueue({
      name: 'wifi-queue',
    }),
    BullModule.registerQueue({
      name: 'opah-queue',
    }),
    forwardRef(() => ImportModule),
    forwardRef(() => VtexModule),
    forwardRef(() => WifiModule),
    forwardRef(() => OpahModule),
  ],
  providers: [
    QueueService,
    ImportProcessor,
    VtexProcessor,
    WifiProcessor,
    OpahProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule implements OnModuleInit {
  private serverAdapter: ExpressAdapter = new ExpressAdapter();

  constructor(
    @InjectQueue('import-queue') private readonly importQueue: Queue,
    @InjectQueue('vtex-queue') private readonly vtexQueue: Queue,
    @InjectQueue('wifi-queue') private readonly wifiQueue: Queue,
    @InjectQueue('opah-queue') private readonly opahQueue: Queue,
  ) {}

  onModuleInit() {
    console.log('Initializing Bull Board...');
    //this.serverAdapter = new ExpressAdapter();
    createBullBoard({
      queues: [
        new BullAdapter(this.importQueue),
        new BullAdapter(this.vtexQueue),
        new BullAdapter(this.wifiQueue),
        new BullAdapter(this.opahQueue),
      ],
      serverAdapter: this.serverAdapter,
    });

    this.serverAdapter.setBasePath('/admin/queues');
    console.log('Bull Board initialized with base path /admin/queues');
  }

  public setupBullBoard(app: INestApplication) {
    if (this.serverAdapter) {
      app.use('/admin/queues', this.serverAdapter.getRouter());
      //console.log(this.serverAdapter.getRouter());
      //console.log(this.serverAdapter);
      console.log('Bull Board route registered successfully');
    } else {
      console.log('ServerAdapter not initialized');
    }
  }
}
