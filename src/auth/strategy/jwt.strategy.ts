import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggedUserDto } from 'src/user/dto';

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    id: number;
    email: string;
  }): Promise<LoggedUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    const dto: LoggedUserDto = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone,
      email: user.email,
    };

    return dto;
  }
}
