import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShareLink } from '../schemas/link.schema';
import { FileMetadata } from '../schemas/file.schema';
import { CreateLinkDto } from './dto/link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectModel(ShareLink.name) private linkModel: Model<ShareLink>,
    @InjectModel(FileMetadata.name) private fileModel: Model<FileMetadata>,
  ) {}

  async createLink(userId: string, dto: CreateLinkDto) {
    const ownerId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId('000000000000000000000000');
    
    const file = await this.fileModel.findOne({ _id: dto.fileId, ownerId });
    if (!file) throw new NotFoundException('File not found');

    const link = new this.linkModel({
      fileId: file._id,
      ownerId: userId,
      maxDownloads: dto.maxDownloads || 0,
      expiresAt: new Date(Date.now() + (dto.ttlHours || 24) * 3600 * 1000),
    });

    await link.save();
    return link;
  }

  async getLinkMetadata(linkId: string) {
    const link = await this.linkModel.findById(linkId).populate('fileId');
    if (!link || !link.isActive) throw new NotFoundException('Link expired or inactive');

    if (link.maxDownloads > 0 && link.downloadCount >= link.maxDownloads) {
      link.isActive = false;
      await link.save();
      throw new ForbiddenException('Download limit reached');
    }

    const file = link.fileId as unknown as FileMetadata;

    // Increment download count
    link.downloadCount += 1;
    await link.save();

    const baseUrl = process.env.APP_URL || 'http://127.0.0.1:3001';
    const downloadUrl = `${baseUrl}/api/files/download/${file._id}`;

    return {
      downloadUrl,
      metadata: {
        encryptedName: file.encryptedName.toString('base64'),
        sizeBytes: file.sizeBytes,
        iv: file.iv.toString('base64'),
      }
    };
  }
}
