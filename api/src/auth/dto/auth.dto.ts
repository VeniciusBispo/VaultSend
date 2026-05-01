import { IsEmail, IsNotEmpty, IsString, IsBase64 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authKey: string; // The hex/base64 key derived on client

  @ApiProperty()
  @IsBase64()
  salt: string;

  @ApiProperty()
  @IsBase64()
  publicKey: string;

  @ApiProperty()
  @IsBase64()
  encPrivateKey: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authKey: string;
}
