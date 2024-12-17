import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AdressesModule } from './adresses/adresses.module';
import { FieldsModule } from './fields/fields.module';
import { CustomersController } from './customers.controller';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from '@src/auth/auth.module';

@Module({
  imports: [AdressesModule, FieldsModule, DatabaseModule, AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, JwtService],
})
export class CustomersModule {}
