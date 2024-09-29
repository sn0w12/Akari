// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avt.mkklcdnv6temp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mn2.mkklcdnv6temp.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
