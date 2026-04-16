import React, { useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import HomepageSection from '@site/src/components/HomepageSection';

import styles from './index.module.css';

// Auto-import all *.mdx files from src/content/homepage/, sorted by filename.
// To control order, prefix filenames with a number: 01_intro.mdx, 02_evidence.mdx, …
const sectionCtx = require.context('../content/homepage', false, /\.mdx$/);
const sections = sectionCtx
  .keys()
  .sort()
  .map((key) => {
    const mod = sectionCtx(key);
    return { Content: mod.default, meta: mod.meta ?? {} };
  });

const heroLinks = [
  { label: 'Get started',              to: '/docs/intro',  primary: true },
  { label: 'Explore the architecture', to: '#',            primary: false },
  { label: 'See use cases',            to: '#',            primary: false },
  { label: 'Follow the tutorials',     to: '/tutorials',   primary: false },
  { label: 'Definition Service',       to: '#',            primary: false },
];

function HomepageHero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroLead}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            {heroLinks.map(({ label, to, primary }) => (
              <Link
                key={label}
                className={clsx(
                  'button',
                  'button--secondary',
                  styles.heroBtn,
                )}
                to={to}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  useEffect(() => {
    document.body.classList.add('page--home');
    return () => document.body.classList.remove('page--home');
  }, []);

  return (
    <Layout title="Home" description="OGC RAINBOW documentation and tutorials">
      <HomepageHero />
      {sections.map(({ Content, meta }, i) => (
        <HomepageSection key={i} alt={i % 2 !== 0} {...meta}>
          <Content />
        </HomepageSection>
      ))}
    </Layout>
  );
}
