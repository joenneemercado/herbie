import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { WifiService } from '@src/connectors/wifi/wifi.service';

//@Injectable()
@Processor('wifi-queue')
export class WifiProcessor {
  constructor(private readonly wifiService: WifiService) {}

  @Process('import-wifi')
  async handleImport(job: Job) {
    console.log('Processor');
    const { filePath, fileType, organization_id, source_id } = job.data;
    console.log(job.data);
    if (fileType === 'csv') {
      await this.wifiService.importFromCSV(
        filePath,
        organization_id,
        source_id,
      );
    } else if (fileType === 'xlsx') {
      await this.wifiService.importFromXLSX(
        filePath,
        organization_id,
        source_id,
      );
    }

    // Após a importação, você pode deletar o arquivo se necessário
    // fs.unlinkSync(filePath);
  }
}
