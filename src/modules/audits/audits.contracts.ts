import { Type } from "@sinclair/typebox";
import { createSelectSchema } from "drizzle-typebox";

import { auditLogs } from "./audits.model.ts";

import { paginationSchema, TypeUuid } from "#libs/utils/schemas.ts";

const uuidColumns = { id: TypeUuid(), userId: TypeUuid(), entityId: TypeUuid() };

export const AUDIT_LOG_ENTITY_CONTRACT = createSelectSchema(auditLogs, uuidColumns);

export const AUDIT_LOG_OUTPUT_CONTRACT = AUDIT_LOG_ENTITY_CONTRACT;

export const AUDIT_LOG_CREATE_INPUT = Type.Object({
  userId: Type.Optional(TypeUuid()),
  action: Type.Union([
    Type.Literal("create"),
    Type.Literal("update"),
    Type.Literal("delete"),
    Type.Literal("login"),
    Type.Literal("logout"),
    Type.Literal("password_change"),
    Type.Literal("password_reset"),
    Type.Literal("verify"),
    Type.Literal("cancel"),
    Type.Literal("confirm"),
    Type.Literal("complete"),
    Type.Literal("pay"),
    Type.Literal("refund"),
  ]),
  entityType: Type.String({ minLength: 1, maxLength: 50 }),
  entityId: Type.Optional(TypeUuid()),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  ipAddress: Type.Optional(Type.String({ maxLength: 45 })),
  userAgent: Type.Optional(Type.String()),
});

export const AUDIT_LOG_OUTPUT_LIST = paginationSchema(AUDIT_LOG_OUTPUT_CONTRACT);

export { AUDIT_ACTION, ENTITY_TYPE } from "./audits.constants.ts";
