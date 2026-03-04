// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OGC RAINBOW',
  tagline: 'Documentation and Tutorials',
  url: 'https://ogcincubator.github.io',
  baseUrl: process.env.BASE_URL ?? '/rainbow-docs/',
  organizationName: 'ogcincubator',
  projectName: process.env.REPO_NAME ?? 'rainbow-docs',

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'tutorials',
        path: 'tutorials',
        routeBasePath: 'tutorials',
        sidebarPath: './sidebars-tutorials.js',
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'OGC RAINBOW',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'mainSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialsSidebar',
            docsPluginId: 'tutorials',
            position: 'left',
            label: 'Tutorials',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Introduction', to: '/docs/intro' },
            ],
          },
          {
            title: 'Tutorials',
            items: [
              { label: 'All tutorials', to: '/tutorials' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'OGC', href: 'https://www.ogc.org' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Open Geospatial Consortium. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

module.exports = config;
