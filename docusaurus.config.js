// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'The Machine-Interpretable Standards Ecosystem',
  tagline: 'Standards, Profiles, Building Blocks, and Registers — an architectural framework for composable, discoverable, and AI‑ready standards infrastructure.',
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
            to: '/docs/architecture',
            position: 'right',
            label: 'Architecture',
          },
          {
            to: '/docs/building-blocks',
            position: 'right',
            label: 'Building Blocks',
          },
          {
            to: '/docs/use-cases',
            position: 'right',
            label: 'Use Cases',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialsSidebar',
            docsPluginId: 'tutorials',
            position: 'right',
            label: 'Tutorials',
          },
          {
            href: 'https://defs.opengis.net/',
            position: 'right',
            label: 'Definition Service',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Architecture', to: '/docs/architecture' },
              { label: 'Building Blocks', to: '/docs/building-blocks' },
              { label: 'Use Cases', to: '/docs/use-cases' },
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
              { label: 'OGC website', href: 'https://www.ogc.org' },
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
