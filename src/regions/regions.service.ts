import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RegionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createRegionDto: CreateRegionDto) {
    const { name } = createRegionDto;

    const existingRegion = await this.prismaService.regions.findFirst({
      where: { name },
    });

    if (existingRegion) {
      throw new ConflictException(`Region with name "${name}" already exists`);
    }

    return this.prismaService.regions.create({
      data: { name },
    });
  }

  findAll() {
    return this.prismaService.regions.findMany();
  }

  async findOne(id: number) {
    const region = await this.prismaService.regions.findUnique({
      where: { id },
      include: { districts: true },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    const existingRegion = await this.prismaService.regions.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return this.prismaService.regions.update({
      where: { id },
      data: updateRegionDto,
    });
  }

  async remove(id: number) {
    const existingRegion = await this.prismaService.regions.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }

    return this.prismaService.regions.delete({
      where: { id },
    });
  }
}
