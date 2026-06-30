// Динамический конфиг Expo.
// baseUrl нужен только для GitHub Pages (сайт лежит под /Aire/). В CI его
// задаёт переменная окружения GH_PAGES_BASE_URL. Локально переменной нет —
// baseUrl пустой, поэтому npm start / npm run preview работают из корня и
// навигация не ломается.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.GH_PAGES_BASE_URL || "",
  },
});
