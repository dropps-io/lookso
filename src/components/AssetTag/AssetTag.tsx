import React, { type FC } from 'react';

import styles from './AssetTag.module.scss';

interface AssetTagProps {
  name: string;
  address: string;
  colorReversed?: boolean;
  onClick?: () => any;
  postHierarchy: 'main' | 'parent' | 'child';
}

const AssetTag: FC<AssetTagProps> = props => (
  <span
    onClick={() => {
      if (props.onClick != null) props.onClick();
    }}
    className={`${props.colorReversed ? styles.AssetTagReverse : styles.AssetTag} ${
      props.onClick != null ? styles.Pointer : ''
    } ${props.postHierarchy}`}
  >
    {props.name ? (
      <span id={'name'} className={`${styles.Name} ${props.postHierarchy}`}>
        {props.name}
      </span>
    ) : (
      <span className={`${styles.Unnamed} ${props.postHierarchy}`}>unnamed</span>
    )}
    <span className={`${styles.Address} ${props.postHierarchy}`}>
      #{props.address.slice(2, 6).toUpperCase()}
    </span>
  </span>
);

export default AssetTag;
