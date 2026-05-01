import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Share } from '../schemas/share.schema';
import { FileMetadata } from '../schemas/file.schema';
import { User } from '../schemas/user.schema';
import { CreateShareDto } from './dto/share.dto';

@Injectable()
export class SharesService {
  constructor(
    @InjectModel(Share.name) private shareModel: Model<Share>,
    @InjectModel(FileMetadata.name) private fileModel: Model<FileMetadata>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async shareFile(senderId: string, dto: CreateShareDto) {
    const file = await this.fileModel.findOne({ _id: dto.fileId, ownerId: senderId });
    if (!file) throw new NotFoundException('File not found');

    const recipient = await this.userModel.findOne({ email: dto.recipientEmail });
    if (!recipient) throw new NotFoundException('Recipient not found');

    const share = new this.shareModel({
      fileId: file._id,
      senderId: new Types.ObjectId(senderId),
      recipientId: recipient._id,
      wrappedDek: Buffer.from(dto.wrappedDek, 'base64'),
      senderPubKey: Buffer.from(dto.senderPubKey, 'base64'),
      permission: dto.permission || 'read',
    });

    await share.save();
    return share;
  }

  async getIncomingShares(userId: string) {
    return this.shareModel.find({ recipientId: userId }).populate('fileId').populate('senderId', 'email publicKey');
  }
}
