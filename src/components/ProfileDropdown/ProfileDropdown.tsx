import React, { type FC } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import styles from './ProfileDropdown.module.scss';
import { formatUrl } from '../../core/utils/url-formating';
import UserTag from '../UserTag/UserTag';
import miniLogoLukso from '../../assets/images/logo_lukso_mini.png';
import { EXPLORER_URL, NATIVE_TOKEN, UP_CLOUD_URL } from '../../environment/endpoints';
import { resetProfile } from '../../store/profile-reducer';
import { resetWeb3 } from '../../store/web3-reducer';
import { getFeedActions } from '../../store/store';

interface ProfileDropdownProps {
  showDropdown: boolean;
  account: string;
  username: string;
  profileImage: string;
  balance: string;
  onClose: () => void;
}

const ProfileDropdown: FC<ProfileDropdownProps> = props => {
  const router = useRouter();
  const dispatch = useDispatch();

  function goTo(path: string) {
    props.onClose();
    if (path.includes('http')) window.open(path, '_blank');
    else router.push(path);
  }

  function disconnectWeb3() {
    props.onClose();
    dispatch(resetProfile());
    dispatch(getFeedActions('Explore').resetFeedReducer());
    dispatch(getFeedActions('Feed').resetFeedReducer());
    dispatch(getFeedActions('Profile').resetFeedReducer());
    dispatch(resetWeb3());
    if (router.asPath.toLowerCase().includes('feed')) router.push('/explore');
  }

  return (
    <>
      <div className={props.showDropdown ? 'backdrop' : ''} onClick={props.onClose}></div>
      <div
        className={`${styles.ProfileDropdown} ${
          !props.showDropdown ? styles.InactiveDropdown : ''
        }`}
      >
        <div className={styles.DropdownHeader}>
          {props.profileImage ? (
            <div
              onClick={() => {
                goTo(`/Profile/${props.account}`);
              }}
              className={styles.ProfilePicMedium}
              style={{ backgroundImage: `url(${formatUrl(props.profileImage)})` }}
            />
          ) : (
            <div
              onClick={() => {
                goTo(`/Profile/${props.account}`);
              }}
              className={styles.ProfilePicMedium}
            />
          )}
          <div
            onClick={() => {
              goTo(`/Profile/${props.account}`);
            }}
            className={styles.ProfileContext}
          >
            <strong className={styles.ProfileName}>
              <UserTag username={props.username} address={props.account} colorReversed />
            </strong>
            <span className={styles.Network}>L16 testnet</span>
          </div>
        </div>
        <div
          className={styles.MyProfile}
          onClick={() => {
            goTo(`/Profile/${props.account}`);
          }}
        >
          <button className={'btn btn-dark'}>My profile</button>
        </div>
        <div className={styles.DropdownButtons}>
          <div className={styles.Balance}>
            <img src={miniLogoLukso.src} alt={''} />
            <span>
              {props.balance.slice(0, 7)} {NATIVE_TOKEN}
            </span>
          </div>
          <div className={styles.TopButtons}>
            <button
              className={'btn btn-secondary'}
              onClick={() => {
                goTo(EXPLORER_URL + 'address/' + props.account);
              }}
            >
              Explorer
            </button>
            <button
              className={'btn btn-secondary'}
              onClick={() => {
                goTo(UP_CLOUD_URL + '/' + props.account);
              }}
            >
              UP.cloud
            </button>
          </div>
          <button
            className={'btn btn-main'}
            onClick={() => {
              disconnectWeb3();
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
