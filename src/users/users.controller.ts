import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/entities/user.entity';
import { AutoMessageDto } from './dto/auto-message.dto';
import { HelloDto } from './dto/hello.dto.js';
import { QuickAnswerDto } from './dto/quickanswer.dto';
import { SignatureDto } from './dto/signature.dto.js';

import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/config')
  getUserConfig(@CurrentUser() user: User) {
    return this.usersService.getUserConfig(user);
  }

  @Get('/quickanswers')
  findQuickAnswers(@Query('q') query: string, @CurrentUser() user: User) {
    return this.usersService.findQuickAnswers(user, query);
  }

  @Post('/quickanswers')
  addQuickAnswer(@Body() body: QuickAnswerDto, @CurrentUser() user: User) {
    return this.usersService.addQuickAnswer(user, body);
  }

  @Put('/quickanswers/:id')
  editQuickAnswer(@Param('id') id: string, @Body() body: QuickAnswerDto) {
    console.log(body);

    return this.usersService.editQuickAnswer(id, body);
  }

  @Delete('/quickanswers/:id')
  deleteQuickAnswer(@Param('id') id: string) {
    return this.usersService.deleteQuickAnswer(+id);
  }

  @Post('/hello')
  addHello(@Body() { hello }: HelloDto, @CurrentUser() user: User) {
    return this.usersService.addHello(user, hello);
  }

  @Delete('/hello')
  deleteHello(@CurrentUser() user: User) {
    return this.usersService.deleteHello(user);
  }

  @Post('/signature')
  addSignature(@Body() { signature }: SignatureDto, @CurrentUser() user: User) {
    return this.usersService.addSignature(user, signature);
  }

  @Delete('/signature')
  deleteSignature(@CurrentUser() user: User) {
    return this.usersService.deleteSignature(user);
  }

  @Put('/automessages')
  editAutoMessages(@CurrentUser() user: User, @Body() body: AutoMessageDto) {
    return this.usersService.editAutoMessages(user, body);
  }
}
