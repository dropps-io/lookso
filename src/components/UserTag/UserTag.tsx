import React, { FC } from 'react';
import styles from './UserTag.module.scss';

interface UserTagProps {
  username: string,
  address: string,
  colorReversed?: boolean,
  onClick?: () => any,
  postHierarchy?: 'main' | 'child' | 'parent' //Prop just to set a 'Parent' class name, in order to differentiate a click on a parent post, than on a comment or repost
}

const UserTag: FC<UserTagProps> = (props) => (
  <span onClick={() => { if (props.onClick) props.onClick() }}
        className={`${props.colorReversed ? styles.UserTagReverse : styles.UserTag} ${props.onClick ? styles.Pointer : ''}`}
        title={props.username.length > 12 ? ((props.username ? '@' + props.username : 'unnamed') + '#' + (props.address ? props.address.slice(2, 6).toUpperCase() : '')) : undefined}
  >
    {
      props.username ?
        <span className={`${styles.Username} ${props.postHierarchy}`}>@{props.username.length > 15 ? props.username.slice(0, 15) + '...' : props.username}</span>
        :
        <span className={`${styles.Unnamed} ${props.postHierarchy}`}>unnamed</span>
    }
    <span className={`${styles.Address} ${props.postHierarchy}`}>#{props.address ? props.address.slice(2, 6).toUpperCase() : ''}</span>
  </span>
);

export default UserTag;
