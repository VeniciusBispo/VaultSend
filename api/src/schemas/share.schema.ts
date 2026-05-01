import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Share extends Document {
  @Prop({ type: Types.ObjectId, ref: 'FileMetadata', required: true })
  fileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId;

  @Prop({ required: true })
  wrappedDek: Buffer;

  @Prop({ required: true })
  senderPubKey: Buffer;

  @Prop({ default: 'read', enum: ['read', 'write'] })
  permission: string;
}

export const ShareSchema = SchemaFactory.createForClass(Share);
