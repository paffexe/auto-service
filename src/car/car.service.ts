import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCarDto } from "./dto/create-car.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CarService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCarDto: CreateCarDto) {
    const { plate_number, vin_number, year, current_user_id } = createCarDto;

    const existingCar = await this.prismaService.car.findFirst({
      where: {
        OR: [{ plate_number }, { vin_number }],
      },
    });

    if (existingCar) {
      throw new ConflictException("Car with same plate or VIN already exists");
    }

    return this.prismaService.car.create({
      data: {
        plate_number,
        vin_number,
        year,
        current_user_id,
      },
    });
  }

  async findAll() {
    return this.prismaService.car.findMany({
      include: {
        current_user: true,
      },
    });
  }

  async findOne(id: number) {
    const car = await this.prismaService.car.findUnique({
      where: { id },
      include: {
        current_user: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return car;
  }

  async update(id: number, updateCarDto: UpdateCarDto) {
    const existingCar = await this.prismaService.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return this.prismaService.car.update({
      where: { id },
      data: updateCarDto,
    });
  }

  async remove(id: number) {
    const existingCar = await this.prismaService.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }

    return this.prismaService.car.delete({
      where: { id },
    });
  }
}
