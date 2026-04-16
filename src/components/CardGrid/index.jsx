import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * Renders a responsive grid of cards.
 *
 * Each card object:
 *   icon    – emoji or short text shown in the coloured icon bubble
 *   variant – 'navy' | 'teal' | 'orange'  (default: 'teal')
 *   title   – card heading
 *   body    – card description (string)
 *   href    – optional link; if provided the whole card is a link
 */
export default function CardGrid({ cards }) {
  return (
    <div className={styles.grid}>
      {cards.map((card, i) => {
        const inner = (
          <>
            <span className={clsx(styles.icon, styles[`icon--${card.variant ?? 'teal'}`])}>
              {card.icon}
            </span>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardBody}>{card.body}</p>
          </>
        );

        return card.href ? (
          <Link key={i} to={card.href} className={styles.card}>
            {inner}
          </Link>
        ) : (
          <div key={i} className={styles.card}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
