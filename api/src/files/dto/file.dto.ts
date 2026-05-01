import { IsNotEmpty, IsNumber, IsOptional, IsBase64, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitUploadDto {
  @ApiProperty()
  @IsBase64()
  encryptedName: string;

  @ApiProperty()
  @IsNumber()
  sizeBytes: number;

  @ApiProperty()
  @IsBase64()
  wrappedDek: string;

  @ApiProperty()
  @IsBase64()
  iv: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ttlSeconds?: number;
}

export class ConfirmUploadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  checksum: string;
}
