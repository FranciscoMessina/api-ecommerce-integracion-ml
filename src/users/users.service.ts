import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { QuickAnswer } from 'src/entities/quickanswer.entity';
import { UserConfig } from 'src/entities/user-config.entity';
import { User } from 'src/entities/user.entity';
import { ArrayContains, Repository } from 'typeorm';
import { MeliOauthResponse } from '../types/meli.types.js';
import { CryptoService } from '../utils/crypto.js';
import { AutoMessageDto } from './dto/auto-message.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QuickAnswerDto } from './dto/quickanswer.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserConfig) private readonly configRepo: Repository<UserConfig>,
    @InjectRepository(QuickAnswer) private readonly qaRepo: Repository<QuickAnswer>,
    private crypto: CryptoService,
  ) {}

  updateMeliConfig(meliID: number, data: MeliOauthResponse) {
    return this.configRepo.update(
      {
        meliId: meliID,
      },
      {
        meliId: data.user_id,
        meliAccess: this.crypto.encrypt(data.access_token),
        meliRefresh: this.crypto.encrypt(data.refresh_token),
        meliTokenExpires: Date.now() + data.expires_in * 1000,
      },
    );
  }

  save(user: User) {
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOneBy({ email });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id }, relations: { config: true } });
  }

  findByMeliId(meliId: number) {
    return this.userRepo.findOne({ where: { config: { meliId: meliId } } });
  }

  findByRefreshToken(refreshToken: string) {
    return this.userRepo.findOneBy({ refreshToken: ArrayContains([refreshToken]) });
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);

    user.config = this.configRepo.create();

    user.quickAnswers = [
      this.qaRepo.create({
        name: 'Ejemplo',
        text: 'Respuesta rapida de ejemplo, modificala y agrega nuevas!',
        color: '#9775fa',
      }),
    ];

    return this.userRepo.save(user);
  }

  editAutoMessages(user: User, { enabled, message }: AutoMessageDto) {
    user.config.autoMessage = {
      enabled,
      message,
    };
    return this.userRepo.save(user);
  }

  addSignature(user: User, signature: string) {
    user.config.signature = signature;
    return this.userRepo.save(user);
  }

  deleteSignature(user: User) {
    user.config.signature = null;
    return this.userRepo.save(user);
  }

  addHello(user: User, hello: string) {
    user.config.hello = hello;
    return this.userRepo.save(user);
  }

  deleteHello(user: User) {
    user.config.hello = null;
    return this.userRepo.save(user);
  }

  getUserConfig(user: User) {
    return this.configRepo.findOne({ where: { user: { id: user.id } } });
  }

  async findQuickAnswers(user: User, query: string) {
    const quickAnswers = await this.qaRepo.find({
      where: { user: { id: user.id } },
      order: {
        position: 'DESC',
      },
    });

    // console.log(quickAnswers);

    if (!query)
      return {
        query,
        results: quickAnswers,
        matches: quickAnswers?.length,
        total: quickAnswers?.length,
      };

    const filtered = quickAnswers.filter((qa) => qa.name.toLowerCase().includes(query.toLowerCase()));

    return {
      query,
      results: filtered,
      matches: filtered?.length,
      total: quickAnswers?.length,
    };
  }

  addQuickAnswer(user: User, body: QuickAnswerDto) {
    const qa = this.qaRepo.create({
      name: body.name,
      text: body.text,
      color: body.color,
      user: { id: user.id },
    });

    return this.qaRepo.save(qa);
  }

  editQuickAnswer(id: string, { name, text, color }: QuickAnswerDto) {
    return this.qaRepo.update(id, {
      name,
      text,
      color,
    });
  }

  async deleteQuickAnswer(id: number) {
    const qa = await this.qaRepo.findOneBy({ id: id });

    return this.qaRepo.remove(qa);
  }

  @OnEvent('meli.tokens.update', {
    async: true,
  })
  updateTokens(data: MeliOauthResponse) {
    console.log(data);

    return this.updateMeliConfig(data.user_id, data);
  }
}
