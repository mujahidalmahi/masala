import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomSchema, CreateRoomDto } from './dto/rooms.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateRoomSchema))
  createRoom(@CurrentUser() user: JwtPayload, @Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(user.sub, dto);
  }

  @Get()
  getActiveRooms(@Query('type') type?: string) {
    return this.roomsService.getActiveRooms(type);
  }

  @Get(':id')
  getRoom(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }

  @Post(':id/join')
  joinRoom(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.roomsService.joinRoom(user.sub, id);
  }

  @Post(':id/leave')
  leaveRoom(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.roomsService.leaveRoom(user.sub, id);
  }

  @Get(':id/participants')
  getParticipants(@Param('id') id: string) {
    return this.roomsService.getParticipants(id);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.roomsService.getMessages(id, limit || 50);
  }
}
