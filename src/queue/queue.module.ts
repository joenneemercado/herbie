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
import { ConfigModule } from '@nestjs/config';
import { AudienceFileProcessor } from './audience-file.processor';
import { AudiencesModule } from '@src/campaigns/audiences/audiences.module';
import { PrismaService } from '@src/database/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        // tls: {
        //   rejectUnauthorized: false,
        // },
        //password: process.env.BULL_PASSWORD,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        //db: 0,
        maxRetriesPerRequest: 2,
        connectTimeout: 10000,
      },
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 10,
        removeOnFail: 30,
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
    BullModule.registerQueue({
      name: 'audience-queue',
    }),
    forwardRef(() => ImportModule),
    forwardRef(() => VtexModule),
    forwardRef(() => WifiModule),
    forwardRef(() => OpahModule),
    forwardRef(() => AudiencesModule),
  ],
  providers: [
    QueueService,
    ImportProcessor,
    VtexProcessor,
    WifiProcessor,
    OpahProcessor,
    AudienceFileProcessor,
    PrismaService,
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
    @InjectQueue('audience-queue')
    private readonly audienceFileQueue: Queue,
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
        new BullAdapter(this.audienceFileQueue),
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
