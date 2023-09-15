import {IHandler, IRequest, mediatrJs} from "../../mediatr.js";
import {dataSource} from "../../data/dataSource";
import {BodyProp, Controller, Post, Route, SuccessResponse} from 'tsoa';
import Joi from "joi";
import UnauthorizedError from "../../types/unauthorizedError";
import {GenerateToken} from "./generateToken";
import {AuthDto} from "../dtos/authDto";
import {ValidateToken} from "./validateToken";
import {TokenType} from "../enums/tokenType";
import {Token} from "../entities/token";

export class RefreshToken implements IRequest<RefreshToken> {
  refreshToken: string;

  constructor(request: Partial<RefreshToken> = {}) {
    Object.assign(this, request);
  }
}

const refreshTokenValidations = {
  params: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

@Route('/identity')
export class RefreshTokenController extends Controller {
  @Post('v1/refreshToken')
  @SuccessResponse('200', 'OK')
  public async refreshToken(@BodyProp() refreshToken: string): Promise<AuthDto> {

    const result = await mediatrJs.send<AuthDto>(new RefreshToken({refreshToken: refreshToken}))

    return result;
  }
}

export class RefreshTokenHandler implements IHandler<RefreshToken, AuthDto> {
  async handle(request: RefreshToken): Promise<AuthDto> {
    await refreshTokenValidations.params.validateAsync(request);

    try {

      const refreshTokenData = await mediatrJs.send<Token>(new ValidateToken({
        token: request.refreshToken,
        type: TokenType.REFRESH
      }));
      const {userId} = refreshTokenData;

      const tokenRepository = dataSource.getRepository(Token);
      await tokenRepository.remove(refreshTokenData);

      const result = await mediatrJs.send<AuthDto>(new GenerateToken({userId: userId}))

      return result;
    } catch (error) {
      throw new UnauthorizedError('Please authenticate');
    }
  }
}

const refreshTokenHandler = new RefreshTokenHandler();
mediatrJs.registerHandler(RefreshToken, refreshTokenHandler);
