import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  authKeyHash: string; // bcrypt hash of the authKey derived on client

  @Prop({ required: true })
  salt: Buffer; // Salt used for PBKDF2 on client

  @Prop({ required: true })
  publicKey: Buffer; // X25519 Public Key

  @Prop({ required: true })
  encPrivateKey: Buffer; // Wrapped Private Key (AES-KW)
}

export const UserSchema = SchemaFactory.createForClass(User);
