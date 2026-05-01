import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileMetadata, FileMetadataSchema } from '../schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileMetadata.name, schema: FileMetadataSchema }]),
  ],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
