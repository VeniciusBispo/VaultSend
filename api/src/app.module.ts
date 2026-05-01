import { Module, Controller, Get } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { LinksModule } from './links/links.module';
import { SharesModule } from './shares/shares.module';
import { ConfigModule } from '@nestjs/config';

@Controller('health')
class HealthController {
  @Get()
  check() { return { status: 'ok', time: new Date().toISOString() }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultsend', {
      family: 4,
    }),
    
    // Feature Modules
    AuthModule,
    FilesModule,
    LinksModule,
    SharesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
