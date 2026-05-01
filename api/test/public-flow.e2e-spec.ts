import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Public Files Flow (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/files/init (POST) - deve permitir upload anônimo', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/files/init',
      payload: {
        encryptedName: 'YmFzZTY0LW5hbWU=',
        sizeBytes: 1024,
        wrappedDek: 'YWJjZA==',
        iv: 'MTIzNDU2Nzg5MDEy',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.fileId).toBeDefined();
    expect(body.uploadUrl).toContain('000000000000000000000000');
  });

  it('/api/links (POST) - deve permitir criar link anônimo', async () => {
    // Primeiro cria um arquivo
    const fileRes = await app.inject({
      method: 'POST',
      url: '/api/files/init',
      payload: {
        encryptedName: 'YmFzZTY0LW5hbWU=',
        sizeBytes: 1024,
        wrappedDek: 'YWJjZA==',
        iv: 'MTIzNDU2Nzg5MDEy',
      },
    });

    const fileId = JSON.parse(fileRes.payload).fileId;

    // Depois cria o link
    const linkRes = await app.inject({
      method: 'POST',
      url: '/api/links',
      payload: {
        fileId: fileId,
        ttlHours: 24
      },
    });

    expect(linkRes.statusCode).toBe(201);
    const body = JSON.parse(linkRes.payload);
    expect(body.id || body._id).toBeDefined();
  });
});
