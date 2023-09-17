import moment from 'moment';
import { dataSource } from '../../data/dataSource';
import { TokenType } from '../enums/tokenType';
import { IHandler, IRequest, mediatrJs } from 'building-blocks/mediatr-js/mediatr.js';
import { AuthDto } from '../dtos/authDto';
import { Token } from '../entities/token';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import config from 'building-blocks/config/config';

export class GenerateToken implements IRequest<AuthDto> {
  userId: number;

  constructor(request: Partial<GenerateToken> = {}) {
    Object.assign(this, request);
  }
}

const generateTokenValidations = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required()
  })
};

const generateJwtToken = (
  userId: number,
  expires: number,
  type: TokenType,
  secret: string = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires,
    type
  };
  return jwt.sign(payload, secret);
};

export class GenerateTokenHandler implements IHandler<GenerateToken, AuthDto> {
  async handle(request: GenerateToken): Promise<AuthDto> {
    await generateTokenValidations.params.validateAsync(request);

    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateJwtToken(
      request.userId,
      accessTokenExpires.unix(),
      TokenType.ACCESS
    );

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateJwtToken(
      request.userId,
      refreshTokenExpires.unix(),
      TokenType.REFRESH
    );

    const tokenRepository = dataSource.getRepository(Token);

    const token = {
      createdAt: new Date(),
      type: TokenType.REFRESH,
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
      userId: request.userId,
      blacklisted: false
    };

    await tokenRepository.save(token);

    const result = {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate()
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate()
      }
    };

    return new AuthDto(result);
  }
}

mediatrJs.registerHandler(GenerateToken, new GenerateTokenHandler());
