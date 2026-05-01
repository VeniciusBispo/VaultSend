import { IsEmail, IsNotEmpty, IsString, IsBase64, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShareDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty()
  @IsEmail()
  recipientEmail: string;

  @ApiProperty()
  @IsBase64()
  wrappedDek: string; // Wrapped with shared secret

  @ApiProperty()
  @IsBase64()
  senderPubKey: string; // Ephemeral public key for ECDH

  @ApiProperty({ required: false, enum: ['read', 'write'] })
  @IsOptional()
  @IsEnum(['read', 'write'])
  permission?: string;
}
