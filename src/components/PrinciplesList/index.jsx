import React from 'react';
import styles from './styles.module.css';

/**
 * Numbered list of principles with a large bold counter bubble on the left.
 *
 * Props:
 *   items – array of { title: string, body: string }
 */
export default function PrinciplesList({ items }) {
  return (
    <ol className={styles.list}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.number}>{i + 1}</span>
          <div className={styles.content}>
            <h4 className={styles.title}>{item.title}</h4>
            <p className={styles.body}>{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
