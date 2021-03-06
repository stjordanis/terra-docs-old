/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path');
const headerLinks = require('./headerLinks.js');
const markdownPlugins = require('./markdownPlugins.js');

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  customDocsPath: path.basename(__dirname) + '/docs',
  title: 'Terra Documentation', // Title for your website.
  tagline: 'Columbus 3',

  website: 'https://terra.money',

  url: 'https://docs.terra.money', // Your docs website URL
  baseUrl: '/', // Base URL for your poject */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'docs',
  organizationName: 'terra-project',

  cname: 'docs.terra.money',

  headerLinks,

  /* path to images for header/footer */
  headerIcon: 'img/docs_logo.svg',
  footerIcon: 'img/inverted_logo.svg',
  favicon: 'img/favicon.png',

  // header -- don't show title text
  disableHeaderTitle: true,

  /* Colors for website */
  colors: {
    primaryColor: "#0c3694",
    secondaryColor: '#0c3694',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `© ${new Date().getFullYear()}`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'ir-black',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js',
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js',
    '/js/code-block-buttons.js',
  //  '/js/viz.js',
  //  '/js/render-graphs.js'
  ],

  stylesheets: [
    "https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css",
    "https://fonts.googleapis.com/css?family=Fira+Code:400,500,700&display=swap"
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  scrollToTop: true,

  // No .html extensions for paths.
  cleanUrl: true,
  
  // social media
  repoUrl: 'https://github.com/terra-project/core', // github
  twitterUsername: 'terra_money',

  // search via algolia
  algolia: {
    placeholder: 'Search',
    apiKey: '5957091e293f7b97f2994bde312aed99',
    indexName: 'terra-project',
    algoliaOptions: {'facetFilters': ["language:en"] } // Optional, if provided by Algolia
  },

  markdownPlugins,
  docsSideNavCollapsible: true,
  enableUpdateTime: true
};

module.exports = siteConfig;
