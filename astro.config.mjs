import { defineConfig, envField } from "astro/config";
import { loadEnv } from "vite";

// Load environment variables properly
const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
const PUBLIC_SANITY_STUDIO_PROJECT_ID =
  env.PUBLIC_SANITY_STUDIO_PROJECT_ID || "";
const PUBLIC_SANITY_STUDIO_DATASET =
  env.PUBLIC_SANITY_STUDIO_DATASET || "production";

import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// Sanity configuration validation
if (!PUBLIC_SANITY_STUDIO_PROJECT_ID) {
  console.warn(
    "⚠️ Missing PUBLIC_SANITY_STUDIO_PROJECT_ID environment variable",
  );
}

if (!PUBLIC_SANITY_STUDIO_DATASET) {
  console.warn(
    "⚠️ Using default 'production' dataset as PUBLIC_SANITY_STUDIO_DATASET was not provided",
  );
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [
    svelte(),
    react(),
    sanity({
      projectId: PUBLIC_SANITY_STUDIO_PROJECT_ID,
      dataset: PUBLIC_SANITY_STUDIO_DATASET,
      useCdn: true,
      apiVersion: "2025-03-11",
      studioBasePath: "/studio",
      stega: {
        studioUrl: "/studio",
      },
    }),
  ],
  env: {
    schema: {
      PUBLIC_SANITY_STUDIO_PROJECT_ID: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SANITY_STUDIO_DATASET: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      SANITY_API_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      STRIPE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      STRIPE_WEBHOOK_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      PUBLIC_SUPABASE_URL: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      SUPABASE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@sanity/astro"],
    },
  },
});