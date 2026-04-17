import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/autonomous-clock-sequencer/",
  plugins: [react()],
});
