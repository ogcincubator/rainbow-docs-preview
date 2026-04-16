import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

import { marked } from 'marked';

/**
 * A full-width homepage section.
 *
 * Props:
 *   overline  – small label rendered above the title (optional)
 *   title     – section heading (optional)
 *   lead      – larger intro paragraph below the title (optional)
 *   alt       – use the off-white background instead of white
 *   center    – center-align the header (used for the Explore section)
 *   children  – section body (MDX content, card grids, …)
 */
export default function HomepageSection({ overline, title, lead, alt, navy, center, children }) {
  return (
    <section className={clsx(styles.section, alt && styles.sectionAlt, navy && styles.sectionNavy)}>
      <div className="container">
        {(overline || title || lead) && (
          <div className={clsx(styles.header, center && styles.headerCenter)}>
            {overline && <span className={styles.overline}>{overline}</span>}
            {title && <h2 className={styles.title}>{title}</h2>}
            {lead && (typeof lead === 'string'
              ? <p className={styles.lead} dangerouslySetInnerHTML={{ __html: marked.parseInline(lead) }} />
              : <p className={styles.lead}>{lead}</p>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}