import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FileMetadata } from '../schemas/file.schema';
import { InitUploadDto } from './dto/file.dto';
// In a real app, import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FileMetadata.name) private fileModel: Model<FileMetadata>,
  ) {}

  async initUpload(userId: string, dto: InitUploadDto) {
    const ownerId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId('000000000000000000000000');
    const s3Key = `uploads/${ownerId.toString()}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const file = new this.fileModel({
      ownerId,
      encryptedName: Buffer.from(dto.encryptedName, 'base64'),
      sizeBytes: dto.sizeBytes,
      s3Key,
      wrappedDek: Buffer.from(dto.wrappedDek, 'base64'),
      iv: Buffer.from(dto.iv, 'base64'),
      status: 'pending',
      expiresAt: dto.ttlSeconds ? new Date(Date.now() + dto.ttlSeconds * 1000) : null,
    });

    await file.save();

    // Mock Presigned URL (Point to our own API for local testing)
    const uploadUrl = `http://127.0.0.1:3001/api/files/mock-s3/${s3Key.replace(/\//g, '-')}`;

    return {
      fileId: file._id,
      uploadUrl,
      s3Key,
    };
  }

  async confirmUpload(userId: string, fileId: string, checksum: string) {
    const ownerId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId('000000000000000000000000');
    
    const file = await this.fileModel.findOneAndUpdate(
      { _id: fileId, ownerId },
      { status: 'ready', checksum },
      { new: true }
    );

    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async getDownloadUrl(userId: string, fileId: string) {
    const file = await this.fileModel.findOne({ _id: fileId, ownerId: userId });
    if (!file || file.status !== 'ready') throw new NotFoundException('File not found');

    // Mock Presigned URL
    const downloadUrl = `https://s3.mock-provider.com/${file.s3Key}?signature=mock-download`;

    return {
      downloadUrl,
      metadata: {
        encryptedName: file.encryptedName.toString('base64'),
        sizeBytes: file.sizeBytes,
        wrappedDek: file.wrappedDek.toString('base64'),
        iv: file.iv.toString('base64'),
      }
    };
  }

  async listFiles(userId: string) {
    return this.fileModel.find({ ownerId: userId, status: 'ready' }).sort({ createdAt: -1 });
  }

  // --- Multipart Support (Mock) ---

  async initMultipart(userId: string, dto: InitUploadDto) {
    const ownerId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId('000000000000000000000000');
    const s3Key = `multipart/${ownerId.toString()}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const file = new this.fileModel({
      ownerId,
      encryptedName: Buffer.from(dto.encryptedName, 'base64'),
      sizeBytes: dto.sizeBytes,
      s3Key,
      wrappedDek: Buffer.from(dto.wrappedDek, 'base64'),
      iv: Buffer.from(dto.iv, 'base64'),
      status: 'pending',
    });
    await file.save();

    return {
      uploadId: file._id,
      s3Key,
    };
  }

  async getMultipartUrl(userId: string, uploadId: string, partNumber: number) {
    // In a real app, call s3.getSignedUrl('uploadPart', ...)
    return {
      url: `http://127.0.0.1:3001/api/files/mock-s3/${uploadId}-part-${partNumber}`,
    };
  }

  async completeMultipart(userId: string, uploadId: string) {
    const ownerId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId('000000000000000000000000');
    const file = await this.fileModel.findOneAndUpdate(
      { _id: uploadId, ownerId },
      { status: 'ready' },
      { new: true }
    );
    if (!file) throw new NotFoundException('Upload not found');
    return file;
  }
}
