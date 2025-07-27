import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { full_name, email, phone, password1, confirm_password } =
      createUserDto;

    if (password1 != confirm_password) {
      throw new BadRequestException("Passwords don't match");
    }

    const password = await bcrypt.hash(confirm_password, 7);

    return this.prismaService.user.create({
      data: { full_name, email, phone, password },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password1) {
      updateUserDto.password1 = await bcrypt.hash(updateUserDto.password1, 7);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prismaService.user.delete({ where: { id } });
  }

  async updateRefreshToken(id: number, refresh_token: string) {
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        refresh_token: refresh_token,
      },
    });
    return updatedUser;
  }

  async activateUser(activation_link: string) {
    if (!activation_link) {
      throw new BadRequestException("Activation link not found");
    }

    const user = await this.prismaService.user.findFirst({
      where: { activation_link },
    });

    if (!user || user.is_activated) {
      throw new BadRequestException("User already activated or invalid link");
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { is_activated: true },
    });

    return {
      message: "User activated successfully",
    };
  }
}
