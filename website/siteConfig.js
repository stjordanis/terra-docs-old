/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: '/img/undraw_open_source.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'Terra Documentation', // Title for your website.
  tagline: 'Columbus 3',
  url: 'https://terra.money/', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'docs',
  organizationName: 'terra-project',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: 'dev-intro', label: 'Docs'},
    {doc: 'validator-intro', label: 'Validator Guide'},
    {href: 'https://s3.ap-northeast-2.amazonaws.com/terra.money.home/static/Terra_White_paper.pdf', label: 'Whitepaper'},
    {href: 'https://agora.terra.money/', label: 'Agora'},
    {href: 'https://agora.terra.money/', label: 'Github'},
    // {page: 'help', label: 'Help'},
    { search: true },
    { languages: true },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/inverted_logo.svg',
  footerIcon: 'img/inverted_logo.svg',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#0F3BA4',
    secondaryColor: '#0F3BA4',
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Terraform Labs PTE.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'atom-one-dark',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/js/code-block-buttons.js',
  ],

  stylesheets: [
    '/css/code-block-buttons.css'
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  scrollToTop: true,
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/undraw_online.svg',
  twitterImage: 'img/undraw_tweetstorm.svg',
  
  // social media
  repoUrl: 'https://github.com/terra-project/core', // github
  twitterUsername: 'terra_money',

  markdownPlugins: [
    (md) => {
      require('remarkable-plantuml')(md, {base_path: './static'});
    }
  ],

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  // enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
