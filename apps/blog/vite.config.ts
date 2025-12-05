import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

const isVercel = process.env.VERCEL === "1";

export default defineConfig({
  plugins: [
    remix({
      // Only use Vercel preset when deploying to Vercel
      ...(isVercel && {
        presets: [
          (async () => {
            const { vercelPreset } = await import("@vercel/remix/vite");
            return vercelPreset();
          })(),
        ],
      }),
    }),
    tsconfigPaths(),
  ],
});
