import { SeatClass } from '../enums/seatClass';
import { SeatType } from '../enums/seatType';

export class SeatDto {
  id: number;
  seatNumber: string;
  seatClass: SeatClass;
  seatType: SeatType;
  flightId: number;
  isReserved: boolean;
  createdAt: Date;
  updatedAt?: Date;

  constructor(request: Partial<SeatDto> = {}) {
    Object.assign(this, request);
  }
}
