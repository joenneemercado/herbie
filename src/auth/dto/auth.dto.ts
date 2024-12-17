import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'usuario@example.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  @ApiProperty()
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senhaSegura123',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @ApiProperty()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  refresh_token: string;
}
