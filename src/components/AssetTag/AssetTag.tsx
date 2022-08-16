import React, { FC } from 'react';
import styles from './AssetTag.module.scss';

interface AssetTagProps {
  name: string,
  address: string,
  colorReversed?: boolean,
  onClick?: () => any
}

const AssetTag: FC<AssetTagProps> = (props) => (
  <span onClick={() => { if (props.onClick) props.onClick() }}
        className={`${props.colorReversed ? styles.AssetTagReverse : styles.AssetTag} ${props.onClick ? styles.Pointer : ''}`}>
    {
      props.name ?
        <span className={styles.Name}>{props.name}</span>
        :
        <span className={styles.Unnamed}>unnamed</span>
    }
    <span className={styles.Address}>#{props.address.slice(2, 6).toUpperCase()}</span>
  </span>
);

export default AssetTag;
