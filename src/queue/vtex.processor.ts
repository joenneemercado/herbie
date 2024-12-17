import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { VtexService } from '@src/connectors/vtex/vtex.service';

//@Injectable()
@Processor('vtex-queue')
export class VtexProcessor {
  constructor(private readonly vtexService: VtexService) {}

  @Process('import-vtex')
  async handleImport(job: Job) {
    console.log('Processor');
    const { filePath, fileType, organization_id, source_id } = job.data;
    console.log(job.data);
    if (fileType === 'csv') {
      await this.vtexService.importFromCSV(
        filePath,
        organization_id,
        source_id,
      );
    } else if (fileType === 'xlsx') {
      await this.vtexService.importFromXLSX(
        filePath,
        organization_id,
        source_id,
      );
    }

    // Após a importação, você pode deletar o arquivo se necessário
    // fs.unlinkSync(filePath);
  }
}
