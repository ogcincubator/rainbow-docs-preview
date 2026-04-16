# OGC RAINBOW Docs — Content Editing Guide

This repository holds the source for the OGC RAINBOW documentation site, built with [Docusaurus](https://docusaurus.io/).

---

## Running the site locally

```bash
npm install      # first time only
npm start        # starts a live-reloading dev server at http://localhost:3000
```

To build a production bundle and preview it:

```bash
npm run build
npm run serve
```

---

## Repository layout (content files only)

```
docusaurus.config.js          ← site title, tagline, navbar links, footer
src/
  content/homepage/           ← one .mdx file per homepage section (auto-loaded)
    01_intro.mdx
    02_evidence.mdx
    03_principles.mdx
    04_explore.mdx
    05_cta.mdx
  pages/
    index.js                  ← homepage hero (title, tagline, hero link grid)
docs/
  architecture.md             ← Architecture page
  building-blocks.md          ← Building Blocks page
  use-cases.mdx               ← Use Cases page (contains the use-case cards)
tutorials/                    ← tutorial pages (one subfolder per tutorial)
static/img/                   ← images and SVGs referenced from docs
```

---

## Editing the homepage

### Site title and tagline

Open `docusaurus.config.js` and change these two lines near the top:

```js
title: 'The Machine-Interpretable Standards Ecosystem',
tagline: 'Standards, Profiles, Building Blocks, and Registers — …',
```

The `title` appears in the hero banner. The `tagline` appears as the subtitle below it.

---

### Hero link grid

The row of buttons below the tagline in the hero banner is defined in `src/pages/index.js`, in the `heroLinks` array:

```js
const heroLinks = [
  { label: 'Explore the architecture', to: '/docs/architecture' },
  { label: 'Create a Building Block',  to: '/docs/building-blocks' },
  { label: 'See use cases',            to: '/docs/use-cases' },
  { label: 'Follow the tutorials',     to: '/tutorials' },
  { label: 'Definitions Service',      to: 'https://defs.opengis.net/' },
];
```

- **Change a label** — edit the `label` string.
- **Change a destination** — edit the `to` value (use an absolute URL for external links).
- **Add a button** — add a new `{ label: '…', to: '…' }` entry.
- **Remove a button** — delete its entry.

---

### Homepage sections (the body of the homepage)

The homepage body is built from the MDX files in `src/content/homepage/`. Each file is a self-contained section. Files are loaded in alphabetical order, so the numeric prefix controls sequence: `01_`, `02_`, etc.

Every section file exports a `meta` object that controls the section header:

| Field | Effect |
|---|---|
| `overline` | Small label above the title (e.g. "Introduction & Motivation") |
| `title` | Large section heading |
| `lead` | Introductory paragraph below the heading (supports **bold**, *italic*) |
| `center` | `true` to center-align everything in the section |
| `navy` | `true` to use a dark navy background (used for the CTA banner) |

The body text below the `meta` export is standard Markdown.

#### 01\_intro.mdx — Introduction & Motivation

Edit the `lead` for the introductory paragraph shown directly under the section heading, and edit the body paragraphs for the main text of the section.

#### 02\_evidence.mdx — The Cost of Ambiguity

This section contains a `cards` array and a `<CardGrid>` component. Each card has:

```js
{
  icon: '$',          // any character or emoji
  variant: 'orange',  // colour: 'orange', 'teal', or 'navy'
  title: '…',
  body:  '…',
}
```

To add a card, add an entry to the `cards` array and the `<CardGrid cards={cards} />` call will pick it up automatically. The prose below the cards is plain Markdown.

#### 03\_principles.mdx — Four Interconnected Principles

This section uses the `PrinciplesList` component to render the numbered list. Each principle is an object in the `principles` array near the bottom of the file:

```js
export const principles = [
  {
    title: 'Machine-Readable Standards',
    body: '…',
  },
  // …
];
```

- **Edit a principle** — change the `title` or `body` string in its object.
- **Add a principle** — add a new `{ title: '…', body: '…' }` entry to the array.
- **Remove a principle** — delete its entry. Numbers are generated automatically.

#### 04\_explore.mdx — Explore the Ecosystem

A grid of cards linking to different parts of the site. Each card has an optional `href` field:

```js
{
  icon: '⚙',
  variant: 'navy',      // 'navy', 'teal', or 'orange'
  title: 'Architecture in Detail',
  body:  '…',
  href:  '/docs/architecture',   // internal path or full URL
}
```

Cards currently linking to `'#'` are placeholders — replace `href` with the correct path when the target page exists.

#### 05\_cta.mdx — Call-to-Action Banner

This section uses raw JSX (React markup) rather than plain Markdown because of its specific layout. To change it, edit the text inside the JSX tags:

- **Heading** — change the text inside `<h2 style={…}>…</h2>`
- **Body paragraph** — change the text inside `<p style={…}>…</p>`
- **Buttons** — change the `to` prop and button label text in the two `<Link>` elements

---

### Adding a new homepage section

1. Create a file in `src/content/homepage/`, e.g. `06_community.mdx`.
2. Export a `meta` object with at least a `title`:
   ```js
   export const meta = {
     overline: 'Community',
     title: 'Get Involved',
   };
   ```
3. Write the section body below in Markdown.

The new section will appear automatically in the correct position based on filename order.

---

## Editing the docs pages

The three main docs pages live in `docs/`. They are standard Markdown files (`.md`) except for `use-cases.mdx`, which also uses JSX components.

### docs/architecture.md and docs/building-blocks.md

Edit these exactly like any Markdown file:

- `#` headings, `##` subheadings, `###` sub-subheadings
- `**bold**`, `*italic*`
- `` `code` `` and fenced code blocks (` ``` `)
- Tables with `|---|` separators
- `:::note … :::` for callout boxes (Docusaurus admonition syntax)
- Mermaid diagrams inside ` ```mermaid ``` ` fences

The frontmatter at the top of each file controls sidebar placement and the page title:

```yaml
---
sidebar_position: 1
title: Architecture
---
```

### docs/use-cases.mdx — Use Case cards

Each use case is wrapped in a `<UseCaseCard label="Use Case A.n">` block. The label (e.g. `"Use Case A.1"`) appears as a badge on the card.

Inside each card, content is plain Markdown:

```mdx
<UseCaseCard label="Use Case A.1">

## Offshore Wind Farm Policy Evaluation {#wind-farm}

#### The Problem
…

#### Building Block Decomposition
…

#### What Becomes Possible
…

</UseCaseCard>
```

**To edit an existing use case** — find its `<UseCaseCard>` block and edit the Markdown inside it.

**To add a new use case:**

1. Add an entry to the `toc` array near the top of the file:
   ```js
   { value: 'My New Use Case', id: 'my-use-case', level: 2 },
   ```
2. Add a new `<UseCaseCard>` block at the end:
   ```mdx
   <UseCaseCard label="Use Case A.8">

   ## My New Use Case {#my-use-case}

   #### The Problem
   …

   </UseCaseCard>
   ```
   The `{#my-use-case}` anchor after the heading must match the `id` in the `toc` entry.

**To remove a use case** — delete its `<UseCaseCard>…</UseCaseCard>` block and remove its entry from the `toc` array.

---

## Editing tutorials

Tutorials live in `tutorials/`. Each tutorial is a subfolder containing one or more Markdown files. The sidebar is configured in `sidebars-tutorials.js`.

To add a new page to an existing tutorial, create a `.md` file in the relevant subfolder and add a frontmatter header:

```yaml
---
sidebar_position: 3
title: My New Step
---
```

---

## Adding images

Place image files in `static/img/` and reference them in Markdown as:

```markdown
![Alt text](/img/my-image.png)
```

The `/img/` path is relative to the site root — no need to include `static/`.
