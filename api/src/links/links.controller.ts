import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/link.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Links')
@Controller('links')
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new anonymous share link' })
  async createLink(@Request() req, @Body() dto: CreateLinkDto) {
    const userId = req.user?.userId || 'anonymous';
    return this.linksService.createLink(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get link metadata (Public)' })
  async getLink(@Param('id') id: string) {
    return this.linksService.getLinkMetadata(id);
  }
}
