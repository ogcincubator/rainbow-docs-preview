import React from 'react';
import styles from './styles.module.css';

/**
 * A styled card for use-case entries in MDX docs.
 *
 * Props:
 *   label    – overline text, e.g. "Use Case A.1"
 *   children – must start with a ## heading (becomes the card title/anchor),
 *              followed by the body content (#### sections + paragraphs)
 *
 * The ## heading is styled as the navy card header via CSS. Keeping it as a
 * real MDX heading (not a prop) means Docusaurus registers the anchor ID and
 * the IntersectionObserver tracks it at the correct scroll position.
 */
export default function UseCaseCard({ label, children }) {
  return (
    <div className={`usecase-card ${styles.card}`}>
      <div className={styles.inner}>
        {label && <span className={styles.overline}>{label}</span>}
        {children}
      </div>
    </div>
  );
}
