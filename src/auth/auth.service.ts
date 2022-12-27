import {
  ForbiddenException,
  HttpCode,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signUp(authDto: AuthDto) {
    // generate hash for password
    const hash = await argon.hash(authDto.password);
    try {
      // save the new user in the db
      const user = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });
      // send jwt token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Данный email уже используется');
        }
      }
      throw error;
    }
  }

  async signIn(authDto: AuthDto) {
    // find the user by email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDto.email,
      },
    });
    // if user does not exist throw exception
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    // compare passwords
    const passwordMatches: boolean = await argon.verify(
      user.hash,
      authDto.password,
    );
    // if password incorrect throw exception
    if (!passwordMatches) {
      throw new ForbiddenException('Неправильный логин или пароль');
    }
    // send jwt token
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
    return { access_token: token };
  }
}
