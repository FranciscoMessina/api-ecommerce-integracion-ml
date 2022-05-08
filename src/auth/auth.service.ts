import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(@Inject(UsersService) private usersService: UsersService, private jwt: JwtService, private config: ConfigService) {}

  async signUp({ email, password }: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) throw new BadRequestException('Email is in use');

    const hash = await argon.hash(password);

    const user = await this.usersService.create({ email, password: hash });

    const accessToken = await this.jwt.signAsync({ sub: user.id });

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') },
    );

    user.refreshToken = [refreshToken];

    await this.usersService.save(user);

    return {
      id: user.id,
      accessToken,
      refreshToken,
      roles: [2001, 1984, 5150],
    };
  }

  async getAuthenticatedUser({ email, password }: CreateUserDto) {
    const user = await this.usersService.findByEmail(email);

    if (user && (await this.verifyPassword(user.password, password))) {
      return user;
    }

    return null;
  }

  async signIn(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id });

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') },
    );

    if (user.refreshToken) {
      user.refreshToken.push(refreshToken);
    } else {
      user.refreshToken = [refreshToken];
    }

    await this.usersService.save(user);

    return { accessToken, refreshToken };
  }

  async signOut(jwt: string) {
    const user = await this.usersService.findByRefreshToken(jwt);

    if (!user) throw new ForbiddenException('Invalid token');

    user.refreshToken = [];
    await this.usersService.save(user);

    return true;
  }

  async refreshToken(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user) throw new ForbiddenException('Invalid token');

    try {
      await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const accessToken = await this.jwt.signAsync({ sub: user.id });

      return { accessToken, id: user.id, roles: [2001, 1984, 5150] };
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }

  async verifyPassword(hash: string, password: string) {
    return argon.verify(hash, password);
  }
}
