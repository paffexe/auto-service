import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto, SignInUserDto } from "../users/dto";
import { UsersService } from "../users/users.service";
import { Admin, User } from "../../generated/prisma";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { MailService } from "../mail/mail.service";
import { CreateAdminDto } from "../admin/dto/create-admin.dto";
import { AdminService } from "../admin/admin.service";
import { SignInAdminDto } from "../admin/dto/signin-admin.dto";
import {
  JwtAdminPayload,
  JwtPayload,
  ResponseFields,
  Tokens,
} from "../common/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
    private readonly adminService: AdminService
  ) {}

  async generateTokens(user: User) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      is_active: user.is_activated,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAdminTokens(admin: Admin) {
    const payload: JwtAdminPayload = {
      id: admin.id,
      email: admin.email,
      is_creator: admin.is_creator,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_ACCESS_TOKEN_KEY,
        expiresIn: process.env.ADMIN_ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.ADMIN_REFRESH_TOKEN_KEY,
        expiresIn: process.env.ADMIN_REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const isExists = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (isExists) {
      throw new ConflictException("Bunday email mavjud");
    }
    const newUser = await this.userService.create(createUserDto);
    try {
      await this.mailService.sendMail(newUser);
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException("Emailga xat yuborishda xatolik");
    }

    return {
      message:
        "Ro'yxatdan o'tdingiz. Accountni faollashtirish uchun emailni tasdiqlang!",
    };
  }

  async logIn(loginUserDto: SignInUserDto, res: Response) {
    const { email, password1 } = loginUserDto;
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException("Email yoki password noto'g'ri");
    }

    const isValid = await bcrypt.compare(loginUserDto.password1, user.password);

    if (!isValid) {
      throw new UnauthorizedException("Email yoki password noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    const refresh_token = await bcrypt.hash(refreshToken, 7);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refresh_token },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return { message: "Tizimga xush kelibsiz", id: user.id, accessToken };
  }

  async logout(userId: number, res: Response): Promise<boolean> {
    const user = await this.prismaService.user.updateMany({
      where: {
        id: userId,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });

    if (!user) {
      throw new ForbiddenException("Access denied");
    }
    res.clearCookie("refreshToken");
    return true;
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refresh_token)
      throw new ForbiddenException("Access denied");

    const rtMatches = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!rtMatches) {
      throw new ForbiddenException("Access denied");
    }

    const tokens: Tokens = await this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.accessToken, 7);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refresh_token: hashedRefreshToken },
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "User refreshed successfully",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }

  // admin
  // async signupAdmin(createAdminDto: CreateAdminDto) {
  //   const { email } = createAdminDto;

  //   const isExists = await this.prismaService.admin.findUnique({
  //     where: { email },
  //   });

  //   if (isExists) {
  //     throw new ConflictException("Bunday email mavjud");
  //   }
  //   const newUser = await this.adminService.create(createAdminDto);
  //   try {
  //     await this.mailService.sendMail(newUser);
  //   } catch (error) {
  //     console.log(error);
  //     throw new ServiceUnavailableException("Emailga xat yuborishda xatolik");
  //   }

  //   return {
  //     message:
  //       "Ro'yxatdan o'tdingiz. Accountni faollashtirish uchun emailni tasdiqlang!",
  //   };
  // }

  async logInAdmin(loginAdmin: SignInAdminDto, res: Response) {
    const { email, password: log_password } = loginAdmin;

    const admin = await this.prismaService.admin.findUnique({
      where: { email },
    });

    console.log("enteredPassword:", log_password);
    console.log("admin.password:", admin?.password);

    if (!admin) {
      throw new UnauthorizedException("Email yoki password noto'g'ri");
    }

    const isValid = await bcrypt.compare(log_password, admin.password);

    if (!isValid) {
      throw new UnauthorizedException("Email yoki password noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateAdminTokens(admin);
    const refresh_token = await bcrypt.hash(refreshToken, 7);
    await this.prismaService.admin.update({
      where: { id: admin.id },
      data: { refresh_token },
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: +process.env.COOKIE_TIME!,
      httpOnly: true,
    });

    return { message: "Tizimga xush kelibsiz", id: admin.id, accessToken };
  }

  async logoutAdmin(userId: number, res: Response) {
    const user = await this.prismaService.admin.updateMany({
      where: {
        id: userId,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });

    if (!user) throw new ForbiddenException("Access denied");
    res.clearCookie("refreshToken");
    return true;
  }

  async refreshAdminToken(
    userId: number,
    refreshToken: string,
    res: Response
  ): Promise<ResponseFields> {
    const user = await this.prismaService.admin.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refresh_token)
      throw new ForbiddenException("Access denied");

    const rtMatches = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!rtMatches) {
      throw new ForbiddenException("Access denied");
    }

    const tokens: Tokens = await this.generateAdminTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.accessToken, 7);

    await this.prismaService.admin.update({
      where: { id: user.id },
      data: { refresh_token: hashedRefreshToken },
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: +process.env.ADMIN_COOKIE_TIME!,
      httpOnly: true,
    });

    return {
      message: "User refreshed successfully",
      userId: user.id,
      accessToken: tokens.accessToken,
    };
  }
}
