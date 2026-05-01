import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { ShareLink, ShareLinkSchema } from '../schemas/link.schema';
import { FileMetadata, FileMetadataSchema } from '../schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShareLink.name, schema: ShareLinkSchema },
      { name: FileMetadata.name, schema: FileMetadataSchema },
    ]),
  ],
  providers: [LinksService],
  controllers: [LinksController],
})
export class LinksModule {}
