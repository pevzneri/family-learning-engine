import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { fontFamily: { display: ["Lora","Georgia","serif"], body: ["DM Sans","system-ui","sans-serif"] }, animation: { "fade-up": "fadeUp 0.3s ease-out both" }, keyframes: { fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } } } } }, plugins: [] };
export default config;
