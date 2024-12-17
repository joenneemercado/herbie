import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ImportService } from '@src/import/import.service';

//@Injectable()
@Processor('import-queue')
export class ImportProcessor {
  constructor(private readonly importService: ImportService) {}

  @Process('import')
  async handleImport(job: Job) {
    console.log('Processor');
    const { filePath, fileType, organization_id, source_id } = job.data;
    console.log(job.data);
    if (fileType === 'csv') {
      await this.importService.importFromCSV(
        filePath,
        organization_id,
        source_id,
      );
    } else if (fileType === 'xlsx') {
      await this.importService.importFromXLSX(
        filePath,
        organization_id,
        source_id,
      );
    }

    // Após a importação, você pode deletar o arquivo se necessário
    // fs.unlinkSync(filePath);
  }
}
