import React, { FC } from 'react';
import styles from './ProfileDropdown.module.scss';
import Link from "next/link";
import {formatUrl} from "../../core/utils/url-formating";
import UserTag from "../UserTag/UserTag";
import miniLogoLukso from "../../assets/images/logo_lukso_mini.png";
import {EXPLORER_URL, NATIVE_TOKEN} from "../../environment/endpoints";

interface ProfileDropdownProps {
  showDropdown: boolean,
  account: string,
  username: string,
  profileImage: string,
  balance: string
}

const ProfileDropdown: FC<ProfileDropdownProps> = (props) => {
  return (
    <div className={`${styles.ProfileDropdown} ${!props.showDropdown ? styles.InactiveDropdown : ''}`}>
      <div className={styles.DropdownHeader}>
        <Link href={`/Profile/${props.account}`}>
          {
            props.profileImage ?
              <div className={styles.ProfilePicMedium} style={{backgroundImage: `url(${formatUrl(props.profileImage)})`}}/>
              :
              <div className={styles.ProfilePicMedium}/>
          }
        </Link>
        <Link href={`/Profile/${props.account}`}>
          <div className={styles.ProfileContext}>
            <strong className={styles.ProfileName}><UserTag username={props.username} address={props.account} colorReversed/></strong>
            <span className={styles.Network}>L16 testnet</span>
          </div>
        </Link>
      </div>
      <Link href={`/Profile/${props.account}`}>
        <div className={styles.MyProfile}>
          <button className={'btn btn-dark'}>My profile</button>
        </div>
      </Link>
      <div className={styles.DropdownButtons}>
        <div className={styles.Balance}>
          <img src={miniLogoLukso.src} alt={''}/>
          <span>{props.balance.slice(0, 7)} {NATIVE_TOKEN}</span>
        </div>
        <div className={styles.TopButtons}>
          <button className={'btn btn-secondary'}><a href={EXPLORER_URL + 'address/' + props.account} target='_blank' rel="noopener noreferrer">Explorer</a></button>
          <button className={'btn btn-secondary'}>UP.cloud</button>
        </div>
        <button className={'btn btn-main'}>Disconnect</button>
      </div>
    </div>
  );
}

export default ProfileDropdown;
