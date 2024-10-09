const { withPlugins } = require('next-composed-plugins');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pick = (obj, keys) =>
  keys.reduce(
    (result, key) => ({
      ...result,
      [key]: obj[key],
    }),
    {},
  );

module.exports = withPlugins(
  {
    swcMinify: true,
    reactStrictMode: true,
    compiler: {
      emotion: true,
    },
    webpack: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        electron: false,
        websocket: false,
      };
      return config;
    },
    images: {
      unoptimized: true,
    },
  },
  [withBundleAnalyzer],
);
