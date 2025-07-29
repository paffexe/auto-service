export class CreateCarHistoryDto {
  purchased_at: string;
  sold_at?: string;
  car_id: number;
  owner_id: number;
}
