import type { UUID } from "node:crypto";

import { BOOKING_STATUS } from "#modules/bookings/bookings.contracts.ts";
import type { Booking } from "#modules/bookings/bookings.types.d.ts";

export const canLeaveReview = (booking: Booking, userId: UUID): boolean => {
  return booking.status === BOOKING_STATUS.completed && booking.userId === userId;
};
