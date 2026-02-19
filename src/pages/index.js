import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const features = [
  {
    title: 'Documentation',
    description: 'Reference documentation covering the concepts, APIs, and components of OGC RAINBOW.',
    link: '/docs/intro',
    linkLabel: 'Read the docs',
  },
  {
    title: 'Tutorials',
    description: 'Step-by-step guides that walk you through concrete use cases from start to finish.',
    link: '/tutorials',
    linkLabel: 'Browse tutorials',
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get started
          </Link>
          <Link className="button button--secondary button--lg" to="/tutorials">
            Tutorials
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ title, description, link, linkLabel }) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to={link}>{linkLabel} →</Link>
    </div>
  );
}

export default function Home() {
  return (
    <Layout title="Home" description="OGC RAINBOW documentation and tutorials">
      <HomepageHeader />
      <main>
        <section className={styles.featuresSection}>
          <div className="container">
            <div className="row">
              {features.map((props) => (
                <FeatureCard key={props.title} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}