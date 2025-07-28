import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, SignInUserDto } from "../users/dto";
import { Response } from "express";
import { CookieGetter } from "../common/decorators/cookit-getter";
import { SignInAdminDto } from "../admin/dto/signin-admin.dto";
import { RefreshTokenGuard } from "../common/guards";
import { GetCurrentUser, GetCurrentUserId } from "../common/decorators";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post("login")
  async login(
    @Body() logInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logIn(logInUserDto, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("signout")
  signout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<boolean> {
    return this.authService.logout(+userId, res);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post("refresh/:id")
  refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken")
    @CookieGetter("refreshToken")
    refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(+userId, refreshToken, res);
  }

  // admin only can log in

  @Post("login/admin")
  async loginAdmin(
    @Body() loginAdminDto: SignInAdminDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logInAdmin(loginAdminDto, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("signout/admin")
  signoutAdmin(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<boolean> {
    return this.authService.logoutAdmin(+userId, res);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @Post("refresh/admin/:id")
  refreshAdmin(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken")
    @CookieGetter("refreshToken")
    refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshAdminToken(+userId, refreshToken, res);
  }
}
