# terra-docs

This repository hosts the Markdown articles and static site generation scripts for Terra documentation, to be hosted on https://docs.terra.money.

## Quickstart

### Clone this resposistory

```bash
git clone https://github.com/ouiliame/terra-docs
```

### How to run this repo (dev server + livereload)

```bash
cd terra-docs/website
yarn install
yarn start
```

Press Ctrl+C to halt the dev server.

### Build the docs

```
yarn build
```

Site will be available in the `website/build` folder.

### Edit the css

Edit the files located in `website/static/css`, and be sure to know that any new CSS that will be written will be automatically included.

## File structure

- `docs/` folder contains markdown files of all of the documentation articles. Due to the way docusaurus is designed, there should be no subdirectories, and it should be flat.

- `website/` folder has everything related to the documentation website.
    - `configSite.js`: edit this to change important site settings at the global level
    - `markdownPlugins.js`: I isolated the code that treats how markdown is processed -- docusaurus uses remarkable.
    - `pages/` folder contains individual pages, separate from documentation (md), and allows you to create custom pages in JSX.
    - `headerLinks.js`: file that exports the links on the header
    - `sidebars.json`: defines the layout of the documentation
    - `blog/` is not something we're using but we may choose to use this as like a changelog for Terra
    - `terra-docusaurus/` is the edited version of docusaurus v1.14.0
    - `static/` - folder for main assets for the website
        - `js/` - javascript files, they automatically get included
        - `css/` - stylesheet files, they automatically get included
            - `fonts/*` - contains main webfont .OTF, .TFF for Terra
            - `fonts.css` - defines fonts
            - `terra-docs-theme.css` - Terra theme applied over the docusaurus theme. It's not really well-written CSS but I tried to stay as close to the Terra design language as I could recreate.

## TODO

- match Terra's design language w/ Logan's CSS
- write documentation based on new TOC
    - protocol documents
        - pictures
    - tutorial
    - spec updates
- replace `remarkable` with `remark`

### Optional

- add documentation and project changelog
- more articles for validators, perhaps create a custom page for validators?
- change file names for docs

## Why GitBook to Docusaurus

Since the release of GitBook v2, they've changed their model and removed their CLI toolchain and many features in favor of their [new pricing model](https://docs.gitbook.com/v2-changes/important-differences).

- no custom CSS styling
- many helpful plugins 
    - uml
    - katex
- no *custom rendering* for markdown

To further customize docusaurus, I pulled out the npm package and made it available under `website/terra-docusaurus`.

## Features of terra-docs

- uses an altered version of docusaurus v1.14.0 called terra-docusaurus
    - using remark instead of remarkable
- support for ReactJS pages for better explanatory components
