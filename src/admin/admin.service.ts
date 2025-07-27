import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createAdminDto: CreateAdminDto) {
    const { full_name, email, phone, password, confirm_password } =
      createAdminDto;

    if (password != confirm_password) {
      throw new BadRequestException("Passwords don't match");
    }

    const hash_password = await bcrypt.hash(confirm_password, 7);

    return this.prismaService.admin.create({
      data: { full_name, email, phone, password: hash_password },
    });
  }

  findAll() {
    return this.prismaService.admin.findMany();
  }

  async findOne(id: number) {
    const user = await this.prismaService.admin.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const user = await this.prismaService.admin.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 7);
    }

    return this.prismaService.user.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  async remove(id: number) {
    const user = await this.prismaService.admin.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return this.prismaService.admin.delete({ where: { id } });
  }

  async updateRefreshToken(id: number, refresh_token: string) {
    const updatedUser = await this.prismaService.admin.update({
      where: {
        id: id,
      },
      data: {
        refresh_token: refresh_token,
      },
    });
    return updatedUser;
  }
}
