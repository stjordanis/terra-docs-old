# Terra Documentation

Terra Documentation site, for docs.terra.money.

## Moving off of GitBook

- no custom CSS styling
- many plugins missing as they've moved on to their pricing model
    - uml
    - katex
- no custom rendering

## Features

- uses an altered version of docusaurus v1.14.0 called terra-docusaurus
- support for ReactJS pages

## File structure

- `docs/` folder contains markdown files of all of the documentation articles. Due to the way docusaurus is designed, there should be no subdirectories, and it should be flat.

- `website/` folder has everything related to the documentation website.
    - `configSite.js`: edit this to change important site settings at the global level
    - `markdownPlugins.js`: I put a more dedicated section on markdown extensions
    - `pages/` folder contains individual pages, separate from documentation (md), and allows you to create custom pages in JSX.
    - `sidebars.json`: defines the layout of the documentation
    - `blog/` is not something we're using but we may choose to use this as like a changelong for Terra
    - `terra-docusaurus/` is the edited version of docusaurus v1.14.0