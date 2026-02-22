import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { payments } from "./payments.model.ts";

import { TypeUuid } from "#libs/utils/schemas.ts";

export { PAYMENT_STATUS } from "./payments.constants.ts";

const uuidColumns = { id: TypeUuid(), bookingId: TypeUuid() };

export const PAYMENT_ENTITY_CONTRACT = createSelectSchema(payments, uuidColumns);
export const PAYMENT_INSERT_CONTRACT = createInsertSchema(payments);

export const PAYMENT_OUTPUT_CONTRACT = PAYMENT_ENTITY_CONTRACT;
