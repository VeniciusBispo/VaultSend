import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FileMetadata extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  encryptedName: Buffer; // Encrypted with owner's key

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ required: true, unique: true })
  s3Key: string;

  @Prop({ required: true })
  wrappedDek: Buffer; // Data Encryption Key (wrapped)

  @Prop({ required: true })
  iv: Buffer; // GCM IV

  @Prop()
  checksum: string;

  @Prop({ default: 'pending', enum: ['pending', 'ready', 'deleted'] })
  status: string;

  @Prop({ index: { expireAfterSeconds: 0 } }) // TTL Index
  expiresAt: Date;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
