import { defineConfig } from "drizzle-kit";
import { readConfig } from "src/lib/config";

export default defineConfig({
    schema: "src/lib/db/schema.ts",
    out: "src/lib/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: readConfig().dbUrl,
    },
});