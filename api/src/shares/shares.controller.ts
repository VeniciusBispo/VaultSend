import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/share.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Shares')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shares')
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @Post()
  @ApiOperation({ summary: 'Share a file with another user' })
  async shareFile(@Request() req, @Body() dto: CreateShareDto) {
    return this.sharesService.shareFile(req.user.userId, dto);
  }

  @Get('incoming')
  @ApiOperation({ summary: 'List files shared with me' })
  async getIncomingShares(@Request() req) {
    return this.sharesService.getIncomingShares(req.user.userId);
  }
}
