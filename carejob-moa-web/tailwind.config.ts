import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: { preflight: false },
  theme: { extend: { colors: { primary: "#FF6737", "primary-bg": "#FFECE1", secondary: "#483D8B", green: "#0AAF6C", info: "#007AFF", red: "#E5484D", title: "#333333", sub: "#757575", line: "#E5E5E5" } } },
  plugins: [],
};
export default config;
