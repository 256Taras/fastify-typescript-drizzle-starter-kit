import { readdir } from "node:fs/promises";
import { join } from "node:path";

import type { Cradle } from "@fastify/awilix";

import { logger } from "#libs/logging/logger.service.ts";

const modulesPath = join(import.meta.dirname, "../../modules");

export async function registerEventHandlers(cradle: Cradle): Promise<void> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await readdir(modulesPath, { withFileTypes: true });

  const directories = entries.filter((entry) => entry.isDirectory());

  const results = await Promise.allSettled(
    directories.map(async (entry) => {
      const handlerPath = join(modulesPath, entry.name, `${entry.name}.event-handlers.ts`);

      try {
        const module = (await import(handlerPath)) as { default?: (cradle: Cradle) => void };

        if (typeof module.default === "function") {
          module.default(cradle);
          logger.debug(`[EventBus] Handler loaded: ${entry.name}.event-handlers.ts`);
        } else {
          logger.debug(`[EventBus] No default export for: ${entry.name}.event-handlers.ts`);
        }
      } catch {
        /* empty */
      }
    }),
  );

  const loadedCount = results.filter((r) => r.status === "fulfilled").length;
  logger.info(`[EventBus] Loaded ${loadedCount} event handler(s) from ${directories.length} module(s)`);
}
