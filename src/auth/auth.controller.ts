import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, SignInUserDto } from "../users/dto";
import { Response } from "express";
import { CookieGetter } from "../common/decorators/cookit-getter";
import { SignInAdminDto } from "../admin/dto/signin-admin.dto";

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

  @Post("signout")
  signout(
    @CookieGetter("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(refreshToken, res);
  }

  @HttpCode(200)
  @Post("refresh/:id")
  refresh(
    @Param("id", ParseIntPipe) id: number,
    @CookieGetter("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(id, refreshToken, res);
  }

  // admin only can log in

  @Post("login/admin")
  async loginAdmin(
    @Body() loginAdminDto: SignInAdminDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logInAdmin(loginAdminDto, res);
  }

  @Post("signout/admin")
  signoutAdmin(
    @CookieGetter("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logoutAdmin(refreshToken, res);
  }

  @HttpCode(200)
  @Post("refresh/admin/:id")
  refreshAdmin(
    @Param("id", ParseIntPipe) id: number,
    @CookieGetter("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshAdminToken(id, refreshToken, res);
  }
}
