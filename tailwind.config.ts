import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Đường dẫn đến file của bạn
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;