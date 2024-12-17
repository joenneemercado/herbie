import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { OpahService } from '@src/connectors/opah/opah.service';

//@Injectable()
@Processor('opah-queue')
export class OpahProcessor {
  constructor(private readonly opahService: OpahService) {}

  @Process('import')
  async handleImport(job: Job) {
    console.log('Processor');
    const { filePath, fileType, organization_id, source_id } = job.data;
    console.log(job.data);
    if (fileType === 'csv') {
      await this.opahService.importFromCSV(
        filePath,
        organization_id,
        source_id,
      );
    } else if (fileType === 'xlsx') {
      await this.opahService.importFromXLSX(
        filePath,
        organization_id,
        source_id,
      );
    }

    // Após a importação, você pode deletar o arquivo se necessário
    // fs.unlinkSync(filePath);
  }
}
