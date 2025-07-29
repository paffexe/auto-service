import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateCarHistoryDto } from "./dto/create-car_history.dto";
import { UpdateCarHistoryDto } from "./dto/update-car_history.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CarHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCarHistoryDto: CreateCarHistoryDto) {
    const { purchased_at, sold_at, car_id, owner_id } = createCarHistoryDto;

    const car = await this.prismaService.car.findUnique({
      where: { id: car_id },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${car_id} not found`);
    }

    const owner = await this.prismaService.user.findUnique({
      where: { id: owner_id },
    });

    if (!owner) {
      throw new NotFoundException(`Owner with ID ${owner_id} not found`);
    }

    return this.prismaService.carHistory.create({
      data: {
        purchased_at: new Date(purchased_at),
        sold_at: sold_at ? new Date(sold_at) : null,
        car_id,
        owner_id,
      },
    });
  }

  async findAll() {
    return this.prismaService.carHistory.findMany({
      include: {
        car: true,
        owner: true,
      },
    });
  }

  async findOne(id: number) {
    const history = await this.prismaService.carHistory.findUnique({
      where: { id },
      include: {
        car: true,
        owner: true,
      },
    });

    if (!history) {
      throw new NotFoundException(`Car history with ID ${id} not found`);
    }

    return history;
  }

  async update(id: number, updateCarHistoryDto: UpdateCarHistoryDto) {
    const existing = await this.prismaService.carHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Car history with ID ${id} not found`);
    }

    return this.prismaService.carHistory.update({
      where: { id },
      data: {
        ...updateCarHistoryDto,
        purchased_at: updateCarHistoryDto.purchased_at
          ? new Date(updateCarHistoryDto.purchased_at)
          : undefined,
        sold_at: updateCarHistoryDto.sold_at
          ? new Date(updateCarHistoryDto.sold_at)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prismaService.carHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Car history with ID ${id} not found`);
    }

    return this.prismaService.carHistory.delete({
      where: { id },
    });
  }
}
