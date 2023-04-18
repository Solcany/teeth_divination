/** @type {import('next').NextConfig} */

const _ = require("lodash");

const nextConfig = {
  //basePath: '/',
  reactStrictMode: false,
  images: {
    unoptimized: true
  },  
  webpack: (config) => {
    // camel-case style names from css modules
    const cssRules = _.find(config.module.rules, (rule) => !!rule.oneOf).oneOf;
    const cssLoaderRules = _.filter(cssRules, (rule) =>
      _.includes(JSON.stringify(rule.use), "css-loader")
    );
    const loaders = _.filter(
      _.flatMap(cssLoaderRules, "use"),
      (loader) => !!loader.options.modules
    );
    for (const loader of loaders) {
      loader.options.modules.exportLocalsConvention = "camelCase";
    }
    return config;
  },
};



module.exports = nextConfig
