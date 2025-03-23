module.exports = {
    siteUrl: 'https://travelrizz.app',
    generateRobotsTxt: true, // Automatically generates robots.txt
    sitemapSize: 7000,
    exclude: [
        '/payment-success',
        '/api/*',
        '/_next/*',
        '/_error',
        '/404'
    ]
};