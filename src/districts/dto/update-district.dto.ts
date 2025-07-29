import { PartialType } from "@nestjs/mapped-types";
import { CreateDistrictDto } from "./create-district.dto";

export class UpdateDistrictDto {
  name?: string;
  regionId?: number;
}
