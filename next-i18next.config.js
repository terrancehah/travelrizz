module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ms', 'zh'],
  },
  defaultNS: 'landing',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};
