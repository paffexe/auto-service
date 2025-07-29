import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./mail/mail.module";
import { AdminModule } from './admin/admin.module';
import { RegionsModule } from './regions/regions.module';
import { DistrictsModule } from './districts/districts.module';
import { CarModule } from './car/car.module';
import { CarHistoryModule } from './car_history/car_history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    AdminModule,
    RegionsModule,
    DistrictsModule,
    CarModule,
    CarHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
