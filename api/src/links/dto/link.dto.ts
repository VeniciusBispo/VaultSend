import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxDownloads?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ttlHours?: number;
}
