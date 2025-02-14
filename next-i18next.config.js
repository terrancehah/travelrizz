module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ms', 'es', 'fr', 'de', 'it', 'cs', 'zh', 'ja', 'ko'],
  },
  defaultNS: 'landing',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};
