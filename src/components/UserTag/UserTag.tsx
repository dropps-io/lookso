import React, { FC } from 'react';
import styles from './UserTag.module.scss';

interface UserTagProps {
  username: string,
  address: string,
  colorReversed?: boolean,
  onClick?: () => any
}

const UserTag: FC<UserTagProps> = (props) => (
  <span onClick={() => { if (props.onClick) props.onClick() }}
        className={`${props.colorReversed ? styles.UserTagReverse : styles.UserTag} ${props.onClick ? styles.Pointer : ''}`}
  >
    {
      props.username ?
        <span className={styles.Username}>@{props.username}</span>
        :
        <span className={styles.Unnamed}>unnamed</span>
    }
    <span className={styles.Address}>#{props.address.slice(2, 6).toUpperCase()}</span>
  </span>
);

export default UserTag;
