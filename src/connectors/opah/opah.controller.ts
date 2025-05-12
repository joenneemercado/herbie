import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OpahService } from './opah.service';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('connectors/opah')
export class OpahController {
  constructor(private readonly opahService: OpahService) {}

  @ApiExcludeEndpoint()
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body() organization_id: string,
    @Body() source_id: number,
  ) {
    if (file) {
      console.log('chegou aqui');

      await this.opahService.addFileToQueue(
        file.path,
        'csv',
        organization_id,
        source_id,
      ); // Adiciona o arquivo na fila
    }
    return { message: 'File has been uploaded and is being processed.' };
  }

  @ApiExcludeEndpoint()
  @Post('upload-aprovacao')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR, // Certifique-se de que a pasta está correta
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadXLSX(
    @UploadedFile() file: Express.Multer.File,
    @Body() organization: { organization_id: string; source_id: number },
  ) {
    if (file) {
      console.log('Caminho do arquivo salvo:', file.path);
      console.log(organization.organization_id);
      console.log(organization.source_id);
      //console.log('chegou aqui,upload-xlsx: ' + JSON.stringify(file));
      await this.opahService.addFileToQueue(
        file.path,
        'xlsx',
        organization.organization_id,
        organization.source_id,
      ); // Adiciona o arquivo na fila
    }
    return { message: 'File has been uploaded and is being processed.' };
  }
}
