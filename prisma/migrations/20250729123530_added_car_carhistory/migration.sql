-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "plate_number" VARCHAR(80) NOT NULL,
    "vin_number" VARCHAR(80) NOT NULL,
    "year" VARCHAR(80) NOT NULL,
    "current_user_id" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarHistory" (
    "id" SERIAL NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3),
    "car_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "CarHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_current_user_id_fkey" FOREIGN KEY ("current_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarHistory" ADD CONSTRAINT "CarHistory_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarHistory" ADD CONSTRAINT "CarHistory_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
