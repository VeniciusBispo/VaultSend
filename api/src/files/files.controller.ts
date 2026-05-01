import { Controller, Post, Body, Get, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { InitUploadDto, ConfirmUploadDto } from './dto/file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a file upload' })
  async initUpload(@Request() req, @Body() dto: InitUploadDto) {
    const userId = req.user?.userId || 'anonymous';
    return this.filesService.initUpload(userId, dto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm file upload completion' })
  async confirmUpload(@Request() req, @Body() dto: ConfirmUploadDto) {
    const userId = req.user?.userId || 'anonymous';
    return this.filesService.confirmUpload(userId, dto.fileId, dto.checksum);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List user files' })
  async listFiles(@Request() req) {
    return this.filesService.listFiles(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  @ApiOperation({ summary: 'Get presigned download URL' })
  async getDownloadUrl(@Request() req, @Param('id') id: string) {
    return this.filesService.getDownloadUrl(req.user.userId, id);
  }

  @Post('multipart/init')
  @ApiOperation({ summary: 'Initialize a multipart upload' })
  async initMultipart(@Request() req, @Body() dto: InitUploadDto) {
    const userId = req.user?.userId || 'anonymous';
    return this.filesService.initMultipart(userId, dto);
  }

  @Get('multipart/:id/part/:partNumber')
  @ApiOperation({ summary: 'Get a presigned URL for a specific part' })
  async getPartUrl(@Request() req, @Param('id') id: string, @Param('partNumber') partNumber: number) {
    const userId = req.user?.userId || 'anonymous';
    return this.filesService.getMultipartUrl(userId, id, partNumber);
  }

  @Post('multipart/:id/complete')
  @ApiOperation({ summary: 'Complete a multipart upload' })
  async completeMultipart(@Request() req, @Param('id') id: string) {
    const userId = req.user?.userId || 'anonymous';
    return this.filesService.completeMultipart(userId, id);
  }

  @Put('mock-s3/:key')
  @ApiOperation({ summary: 'Mock S3 upload endpoint for testing' })
  async mockS3Upload(@Param('key') key: string) {
    console.log(`Receiving mock upload for: ${key}`);
    return { status: 'ok' };
  }
}
