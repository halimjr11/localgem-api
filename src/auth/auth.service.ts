import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import type { AuthUser, JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { id, email: userEmail, name } = user;
      return { id, email: userEmail, name };
    }
    return null;
  }

  login(user: AuthUser) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          'your-refresh-secret-key',
        expiresIn:
          Number(this.configService.get<number>('jwt.refreshExpiresIn')) ||
          7 * 24 * 60 * 60,
      }),
    };
  }

  async register(userData: { email: string; password: string; name: string }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
  }

  refresh(refreshToken: string) {
    const decoded = this.jwtService.verify<JwtPayload>(refreshToken, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        'your-refresh-secret-key',
    });
    const payload: JwtPayload = { email: decoded.email, sub: decoded.sub };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
