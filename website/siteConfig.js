/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const headerLinks = require('./headerLinks.js');
const markdownPlugins = require('./markdownPlugins.js');

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'Terra Documentation', // Title for your website.
  tagline: 'Columbus 3',

  website: 'https://terra.money',

  url: 'https://ouiliame.github.io', // Your docs website URL
  baseUrl: '/terra-docs/', // Base URL for your poject */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'terra-docs',
  organizationName: 'ouiliame',

  headerLinks,

  /* path to images for header/footer */
  headerIcon: 'img/docs_logo.svg',
  footerIcon: 'img/inverted_logo.svg',
  favicon: 'img/favicon.ico',

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
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js'
  ],

  stylesheets: [
    "https://fonts.googleapis.com/css?family=Oxygen+Mono&display=swap"
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
    apiKey: 'my-api-key',
    indexName: 'my-index-name',
    algoliaOptions: {} // Optional, if provided by Algolia
  },

  markdownPlugins,
  docsSideNavCollapsible: true,
  enableUpdateTime: true
};

module.exports = siteConfig;
