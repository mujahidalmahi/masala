import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomSchema, CreateRoomDto, UpdateRoomSchema, UpdateRoomDto } from './dto/rooms.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types';

@Controller('api/rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  createRoom(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(CreateRoomSchema)) dto: CreateRoomDto) {
    return this.roomsService.createRoom(user.sub, dto);
  }

  @Get()
  getActiveRooms(@Query('type') type?: string) {
    return this.roomsService.getActiveRooms(type);
  }

  @Patch(':id')
  updateRoom(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateRoomSchema)) dto: UpdateRoomDto,
  ) {
    return this.roomsService.updateRoom(user.sub, id, dto);
  }

  @Delete(':id')
  deleteRoom(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.roomsService.deleteRoom(user.sub, id);
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
