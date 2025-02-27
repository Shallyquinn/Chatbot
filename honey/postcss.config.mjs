/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;

// postcss.config.js
// postcss.config.cjs
// 
// module.exports = {
//   plugins: [ require('@tailwindcss/postcss'), require('tailwindcss'), require('autoprefixer')],
// };

