import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

type JwtPayload = { sub: number; email: string; roles: string[] }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.get<string>('JWT_SECRET', 'dev-secret'),
      ignoreExpiration: false,
    })
  }

  validate(payload: JwtPayload) {
    // ce returnezi aici devine req.user
    return { userId: payload.sub, email: payload.email, roles: payload.roles }
  }
}