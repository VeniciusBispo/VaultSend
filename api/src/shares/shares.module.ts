import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { FileMetadata, FileMetadataSchema } from '../schemas/file.schema';
import { Share, ShareSchema } from '../schemas/share.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FileMetadata.name, schema: FileMetadataSchema },
      { name: Share.name, schema: ShareSchema },
    ]),
  ],
  providers: [SharesService],
  controllers: [SharesController],
})
export class SharesModule {}
