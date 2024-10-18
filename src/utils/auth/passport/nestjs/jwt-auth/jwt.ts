import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function initiatePassportJwt(packageManager: string) {
  try {
    console.log("installing passport ");
    const passportPackages = [
      "@nestjs/jwt",
      "passport",
      "@nestjs/passport",
      "passport-jwt",
      "@types/passport-jwt",
      "argon2",
    ];
    const installCmd = `${packageManager} ${
      packageManager === "yarn" ? "add " : "install"
    } ${passportPackages.join(" ")} `;

    execSync(installCmd, { stdio: "inherit" });
  } catch (error) {
    console.error("failed to install passport jwt package", error);
  }
}

export async function createAuthFolders() {
  try {
    console.log("configuring passport-jwt");
    const authFolders = ["module", "service", "controller"];
    for (let i = 0; i < authFolders.length; i++) {
      console.log("generating auth folders");
      execSync(`nest g ${authFolders[i]} auth`);
    }
    const authPath = path.join("src", "auth");
    const installFolderCmd = "mkdir dto strategies types";
    execSync(installFolderCmd, { cwd: authPath, stdio: "inherit" });
    const installcommonFolderCmd = "mkdir common";
    execSync(installcommonFolderCmd, {
      cwd: path.join("src"),
      stdio: "inherit",
    });
    const commonFolderPath = path.join("src", "common");
    const commonSubFoldersCmd = "mkdir decorators guards";
    execSync(commonSubFoldersCmd, { cwd: commonFolderPath, stdio: "inherit" });
  } catch (error) {
    console.error("configuring nestjs jwt failed ", error);
  }
}

export async function configureAuthFiles(ormType: string) {
  try {
    const strategyFiles = [
      {
        path: path.join("src", "auth", "strategies", "at.strategy.ts"),
        content: `
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('AT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
        `,
      },
      {
        path: path.join("src", "auth", "strategies", "rt.strategy.ts"),
        content: `
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtPayloadWithRt } from '../types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
        `,
      },
      {
        path: path.join("src", "auth", "strategies", "index.ts"),
        content: `
export * from './at.strategy';
export * from './rt.strategy';
        `,
      },
    ];

    const prisma_auth_files = [
      {
        path: path.join("src", "auth", "auth.module.ts"),
        content: `
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
        `,
      },
      {
        path: path.join("src", "auth", "auth.service.ts"),
        content: `
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

import { AuthDto } from './dto';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const hashedPassword = await argon.hash(dto.password);

    const user = await this.prisma.user
      .create({
        data: {
          email: dto.email,
          password:hashedPassword,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }
        throw error;
      });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon.verify(user.password, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.hashedRt, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
        `,
      },
      {
        path: path.join("src", "auth", "auth.controller.ts"),
        content: `
 import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
import { RtGuard } from '../common/guards';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
        `,
      },
      {
        path: path.join("src", "auth", "dto", "auth.dto.ts"),
        content: `
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
        `,
      },
      {
        path: path.join("src", "auth", "dto", "index.ts"),
        content: `
export * from './auth.dto';
        `,
      },
    ];

    const drizzle_auth_files = [
      {
        path: path.join("src", "auth", "auth.module.ts"),
        content: `
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, GoogleStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    GoogleStrategy,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
        `,
      },
      {
        path: path.join("src", "auth", "auth.service.ts"),
        content: `
      import {
        ForbiddenException,
        HttpException,
        Inject,
        Injectable,
        UnauthorizedException,
      } from "@nestjs/common";
      import { UtilsService } from "src/utils/utils.service";
      import { Tokens } from "src/types";
      import {
        CreateGoogleUserDTO,
        loginDTO,
        passwordChangeDTO,
        CreateAccountDTO,
      } from "./dto";
      import * as argon from "argon2";
      import { ConfigService } from "@nestjs/config";
      import { JwtService } from "@nestjs/jwt";
      import { LibSQLDatabase } from "drizzle-orm/libsql";
      import * as schema from "../schema/schema";
      import { and, eq, isNotNull } from "drizzle-orm";
      
      @Injectable()
      export class AuthService {
        private readonly users = schema.Users;
      
        constructor(
          @Inject("DB_DEV") private db: LibSQLDatabase<typeof schema>,
          private jwtService: JwtService,
          private config: ConfigService
        ) {}
      
        
        async create(dto: CreateAccountDTO): Promise<Tokens> {
          try {
            const hashedPassword = await argon.hash(dto.password);
            const userRegistered = await this.db
              .insert(this.users)
              .values({
                ...dto,
                password: hashedPassword,
              })
              .returning();
      
            const user = userRegistered[0];
      
            const Tokens = await this.getTokens(user.id, user.email);
            await this.updateHashedToken(user.id, Tokens.refresh_token);
            return Tokens;
          } catch (error) {
            if (error.message.includes("UNIQUE constraint failed")) {
              const regex = /UNIQUE constraint failed: (.+)/;
              const match = error.message.match(regex);
              const key = match ? match[1].split(".")[1] : "unknown field";
              throw new HttpException(
                \`User with \${key}: \${dto[key]} already exists\`,
                400
              );
            }
            throw error;
          }
        }
      
        
        async login(dto: loginDTO): Promise<Tokens> {
          try {
            const user = await this.db.query.Users.findFirst({
              where: eq(this.users.email, dto.email),
            });
      
            if (!user) {
              throw new UnauthorizedException("no user found for this email");
            }
      
            const passwordMatch = await argon.verify(user.password, dto.password);
            if (!passwordMatch) {
              throw new UnauthorizedException("invalid password");
            }
            const Tokens = await this.getTokens(user.id, user.email);
            await this.updateHashedToken(user.id, Tokens.refresh_token);
            return Tokens;
          } catch (error) {
            throw error;
          }
        }
      
        
        async logout(userId: number): Promise<void> {
          try {
            await this.db
              .update(this.users)
              .set({ hashedRt: null })
              .where(and(eq(this.users.id, userId), isNotNull(this.users.hashedRt)));
          } catch (error) {
            throw new error();
          }
        }
      
       
        async refreshTokens(userId: number, rt: string): Promise<Tokens> {
          try {
            const user = await this.db.query.Users.findFirst({
              where: eq(this.users.id, userId),
            });
            if (!user || !user.hashedRt) {
              throw new UnauthorizedException("unauthorized request");
            }
            const rtMatch = await argon.verify(user.hashedRt, rt);
            if (!rtMatch) {
              throw new UnauthorizedException("unauthorized request");
            }
            const Tokens = await this.getTokens(user.id, user.email);
            await this.updateHashedToken(user.id, Tokens.refresh_token);
            return Tokens;
          } catch (error) {
            throw error;
          }
        }
      
       
        async getTokens(userId: number, email: string): Promise<Tokens> {
          const jwtPayload: JwtPayload = {
            sub: userId,
            email: email,
          };
      
          const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
              secret: this.config.get<string>("AT_SECRET"),
              expiresIn: "15m",
            }),
            this.jwtService.signAsync(jwtPayload, {
              secret: this.config.get<string>("RT_SECRET"),
              expiresIn: "7d",
            }),
          ]);
      
          return {
            access_token: at,
            refresh_token: rt,
          };
        }
      
        
        async updateHashedToken(userId: number, rt: string) {
          const hashedtoken = await argon.hash(rt);
      
          const updateToken = await this.db
            .update(this.users)
            .set({ hashedRt: hashedtoken })
            .where(eq(this.users.id, userId));
        }
      }
      `,
      },
      {
        path: path.join("src", "auth", "auth.controller.ts"),
        content: `
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  CreateAccountDTO,
  CreateGoogleUserDTO,
  loginDTO,
  passwordChangeDTO,
} from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AtGuard, GoogleGuard, RtGuard } from "src/common/guards";
import {
  getCurrentUser,
  getCurrentUserId,
  Public,
} from "src/common/decorators";
import { Tokens } from "src/types";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("create-account")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAccountDTO) {
    return await this.authService.create(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: loginDTO) {
    return await this.authService.login(dto);
  }

  @Public()
  @UseGuards(RtGuard)
  @Patch("refresh-token")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @getCurrentUserId() userId: number,
    @getCurrentUser("refreshToken") refreshToken: string
  ) {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @Patch("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@getCurrentUserId() userId: number) {
    return await this.authService.logout(userId);
  }
}

        `,
      },
      {
        path: path.join("src", "auth", "dto", "auth.dto.ts"),
        content: `
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
        `,
      },
      {
        path: path.join("src", "auth", "dto", "index.ts"),
        content: `
export * from './auth.dto';
        `,
      },
    ];

    const auth_types_files = [
      {
        path: path.join("src", "auth", "types", "index.ts"),
        content: `
export * from './tokens.type';
export * from './jwtPayload.type';
export * from './jwtPayloadWithRt.type';
        `,
      },
      {
        path: path.join("src", "auth", "types", "jwtPayload.type.ts"),
        content: `
export type JwtPayload = {
email: string;
sub: number;
};
        `,
      },
      {
        path: path.join("src", "auth", "types", "jwtPayloadWithRt.type.ts"),
        content: `
import { JwtPayload } from '.';

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };
        `,
      },
      {
        path: path.join("src", "auth", "types", "tokens.type.ts"),
        content: `
export type Tokens = {
access_token: string;
refresh_token: string;
};
        `,
      },
    ];

    const common_files = [
      {
        path: path.join(
          "src",
          "common",
          "decorators",
          "get-current-user-id.decorator.ts"
        ),
        content: `
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../auth/types';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);
        `,
      },
      {
        path: path.join(
          "src",
          "common",
          "decorators",
          "get-current-user.decorator.ts"
        ),
        content: `
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRt } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
        `,
      },
      {
        path: path.join("src", "common", "decorators", "public.decorator.ts"),
        content: `
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
        `,
      },
      {
        path: path.join("src", "common", "decorators", "index.ts"),
        content: `
export * from './get-current-user.decorator';
export * from './get-current-user-id.decorator';
export * from './public.decorator';
        `,
      },
      {
        path: path.join("src", "common", "guards", "at.guard.ts"),
        content: `
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }
}
        `,
      },
      {
        path: path.join("src", "common", "guards", "rt.guard.ts"),
        content: `
import { AuthGuard } from '@nestjs/passport';

export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
        `,
      },
      {
        path: path.join("src", "common", "guards", "index.ts"),
        content: `
export * from './at.guard';
export * from './rt.guard';
        `,
      },
    ];

    common_files.forEach((file) => {
      fs.writeFileSync(file.path, file.content);
    });

    strategyFiles.forEach((file) => {
      fs.writeFileSync(file.path, file.content);
    });

    auth_types_files.forEach((file) => {
      fs.writeFileSync(file.path, file.content);
    });

    switch (ormType) {
      case "prisma":
        prisma_auth_files.forEach((file) => {
          fs.writeFileSync(file.path, file.content);
        });
        break;
      case "drizzle":
        drizzle_auth_files.forEach((file) => {
          fs.writeFileSync(file.path, file.content);
        });
        break;
      default:
        throw new Error("no orm type provided");
    }
  } catch (error) {
    console.error("failed to configure auth files", error);
  }
}
