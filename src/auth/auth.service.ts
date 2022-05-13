import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, @Inject(UsersService) private usersService: UsersService, private config: ConfigService) {}

  async signUp({ email, password }: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) throw new BadRequestException('Email is in use');

    const hash = await argon.hash(password);

    const user = await this.usersService.create({ email, password: hash });

    const accessToken = await this.getJWT(user.id, 'access');

    const refreshToken = await this.getJWT(user.id, 'refresh');

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
    const accessToken = await this.getJWT(user.id, 'access');

    const refreshToken = await this.getJWT(user.id, 'refresh');

    if (user.refreshToken) {
      user.refreshToken.push(refreshToken);
    } else {
      user.refreshToken = [refreshToken];
    }

    await this.usersService.save(user);

    return { accessToken, refreshToken };
  }

  async signOut(refreshToken: string, allDevices: boolean) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user) throw new ForbiddenException('Invalid token');

    let updatedUser;
    if (allDevices) {
      updatedUser = await this.removeRefreshToken(user);
    } else {
      updatedUser = await this.removeRefreshToken(user, refreshToken);
    }

    if (!updatedUser.refreshToken.includes(refreshToken)) return true;

    return false;
  }

  async refreshToken(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user) throw new ForbiddenException('Invalid token');

    try {
      await this.verifyJWT(refreshToken, 'refresh');

      const accessToken = await this.getJWT(user.id, 'access');

      return { accessToken, id: user.id, roles: [2001, 1984, 5150] };
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }

  async verifyPassword(hash: string, password: string) {
    return argon.verify(hash, password);
  }

  async getJWT(sub: string | number, type: 'access' | 'refresh') {
    const expiresIn =
      type === 'access' ? this.config.get<string>('JWT_ACCESS_EXPIRES_IN') : this.config.get<string>('JWT_REFRESH_EXPIRES_IN');

    const secret = type === 'access' ? this.config.get<string>('JWT_ACCESS_SECRET') : this.config.get<string>('JWT_REFRESH_SECRET');

    return this.jwt.signAsync(
      { sub },
      {
        expiresIn,
        secret,
      },
    );
  }

  async verifyJWT(token: string, type: 'access' | 'refresh') {
    const secret = type === 'access' ? this.config.get<string>('JWT_ACCESS_SECRET') : this.config.get<string>('JWT_REFRESH_SECRET');

    return this.jwt.verifyAsync(token, {
      secret,
    });
  }

  async removeRefreshToken(user: User, refreshToken?: string) {
    if (refreshToken) {
      user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
    } else {
      user.refreshToken = [];
    }

    return this.usersService.save(user);
  }
}
