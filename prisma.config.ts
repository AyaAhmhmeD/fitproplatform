// Prisma 7 configuration file.
//
// NOTE: `defineConfig` lives in the `prisma` package's `prisma/config`
// export (re-exported from `@prisma/config`) — NOT in `@prisma/client`.
// `@prisma/client` only exports the generated runtime client (`PrismaClient`)
// and has never exported `defineConfig`; importing it from there is a
// version mix-up and fails to resolve, which is what VS Code was flagging.
import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Explicit for clarity — this is also Prisma's default lookup path, so
  // this line can be removed safely if you ever move the schema.
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    // Lets `prisma migrate dev` / `prisma migrate reset` auto-run the seed
    // script after migrating, in addition to the standalone `npm run db:seed`.
    seed: "tsx prisma/seed.ts",
  },
});
