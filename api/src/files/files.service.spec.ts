import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FilesService } from './files.service';
import { FileMetadata } from '../schemas/file.schema';
import { Types } from 'mongoose';

describe('FilesService', () => {
  let service: FilesService;
  let model: any;

  const mockFileModel = {
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue(dto),
    })),
    constructor: jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      save: jest.fn().mockResolvedValue(dto),
    })),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  // Mock para o construtor do Mongoose (o 'new this.fileModel')
  function MockModel(dto) {
    this.data = dto;
    this._id = new Types.ObjectId();
    this.save = jest.fn().mockResolvedValue(this);
    // Adicionando as propriedades do DTO para o teste ver
    Object.assign(this, dto);
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getModelToken(FileMetadata.name),
          useValue: MockModel, // Usando a função construtora mock
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    model = module.get(getModelToken(FileMetadata.name));
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve usar ID anônimo quando o userId for "anonymous"', async () => {
    const dto = {
      encryptedName: 'dGVzdC50eHQ=', // test.txt
      sizeBytes: 1024,
      wrappedDek: 'YWJjZA==',
      iv: 'MTIzNDU2Nzg5MDEy',
    };

    const result = await service.initUpload('anonymous', dto as any);
    
    // O ID anônimo que definimos é '000000000000000000000000'
    expect(result.uploadUrl).toContain('uploads-000000000000000000000000');
  });
});
