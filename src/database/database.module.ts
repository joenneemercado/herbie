import { Module, type DynamicModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    console.log('DatabaseModule.forRoot() called'); // Adicionar log para depuração
    return {
      module: DatabaseModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }
}
