import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ShareLink extends Document {
  @Prop({ type: Types.ObjectId, ref: 'FileMetadata', required: true })
  fileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ default: 0 })
  maxDownloads: number;

  @Prop({ default: 0 })
  downloadCount: number;

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const ShareLinkSchema = SchemaFactory.createForClass(ShareLink);
