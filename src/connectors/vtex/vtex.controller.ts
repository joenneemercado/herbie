import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { VtexService } from './vtex.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('connectors/vtex')
export class VtexController {
  constructor(private readonly vtexService: VtexService) {}

  @Post('hook')
  async createNewNotification(
    @Res() res: Response,
    @Body() msg: any,
  ): Promise<any> {
    //this.logger.warn(JSON.stringify(msg));
    this.vtexService.createFromHook(msg);
    res.status(200);
    return res.json(msg);
  }

  @ApiExcludeEndpoint()
  @Post('import/customer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/uploads', // Certifique-se de que a pasta está correta
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
      await this.vtexService.addFileToQueue(
        file.path,
        'xlsx',
        organization.organization_id,
        organization.source_id,
      ); // Adiciona o arquivo na fila
    }
    return { message: 'File has been uploaded and is being processed.' };
  }
}
