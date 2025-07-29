import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DistrictsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createDistrictDto: CreateDistrictDto) {
    const { name, regionId } = createDistrictDto;

    const existingRegion = await this.prismaService.regions.findUnique({
      where: { id: regionId },
    });

    if (!existingRegion) {
      throw new ConflictException(`Region with ID ${regionId} does not exist`);
    }

    const existingDistrict = await this.prismaService.districts.findFirst({
      where: { name, regionId },
    });

    if (existingDistrict) {
      throw new ConflictException(
        `District "${name}" already exists in this region`
      );
    }

    return this.prismaService.districts.create({
      data: {
        name,
        regionId,
      },
    });
  }

  async findAll() {
    return this.prismaService.districts.findMany({
      include: {
        region: true,
      },
    });
  }

  async findOne(id: number) {
    const district = await this.prismaService.districts.findUnique({
      where: { id },
      include: { region: true },
    });

    if (!district) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    return district;
  }

  async update(id: number, updateDistrictDto: UpdateDistrictDto) {
    const existingDistrict = await this.prismaService.districts.findUnique({
      where: { id },
    });

    if (!existingDistrict) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    return this.prismaService.districts.update({
      where: { id },
      data: updateDistrictDto,
    });
  }

  async remove(id: number) {
    const existingDistrict = await this.prismaService.districts.findUnique({
      where: { id },
    });

    if (!existingDistrict) {
      throw new NotFoundException(`District with ID ${id} not found`);
    }

    return this.prismaService.districts.delete({
      where: { id },
    });
  }
}
