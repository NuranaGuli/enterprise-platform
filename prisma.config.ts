import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // `prisma generate` doesn't need a live connection, only `db push` /
    // `db seed` / the app itself do — so we fall back to a placeholder
    // here to avoid breaking `npm install` (postinstall runs `prisma
    // generate`) before a real .env has been created.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
