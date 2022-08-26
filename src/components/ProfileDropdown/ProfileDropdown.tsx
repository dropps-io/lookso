import React, {FC, useState} from 'react';
import styles from './ProfileDropdown.module.scss';
import {formatUrl} from "../../core/utils/url-formating";
import UserTag from "../UserTag/UserTag";
import miniLogoLukso from "../../assets/images/logo_lukso_mini.png";
import {EXPLORER_URL, NATIVE_TOKEN} from "../../environment/endpoints";
import {useRouter} from "next/router";
import ActionModal from "../Modals/ActionModal/ActionModal";

interface ProfileDropdownProps {
  showDropdown: boolean,
  account: string,
  username: string,
  profileImage: string,
  balance: string,
  onClose: () => void
}

const ProfileDropdown: FC<ProfileDropdownProps> = (props) => {
  const router = useRouter();
  const [showNoUpCloud, setShowNoUpCloud] = useState(false);

  function goTo(path: string) {
    props.onClose();
    if (path.includes('http')) window.open(path, '_blank');
    else router.push(path);
  }

  return (
    <>
      <ActionModal open={showNoUpCloud} onClose={() => setShowNoUpCloud(false)} textToDisplay={'Unavailable (still running on L14 testnet)'} btnText={'Ok 😔'} callback={() => setShowNoUpCloud(false)}/>
      <div className={`${styles.ProfileDropdown} ${!props.showDropdown ? styles.InactiveDropdown : ''}`}>
        <div className={styles.DropdownHeader}>
          {
            props.profileImage ?
              <div onClick={() => goTo(`/Profile/${props.account}`)} className={styles.ProfilePicMedium} style={{backgroundImage: `url(${formatUrl(props.profileImage)})`}}/>
              :
              <div onClick={() => goTo(`/Profile/${props.account}`)} className={styles.ProfilePicMedium}/>
          }
          <div onClick={() => goTo(`/Profile/${props.account}`)} className={styles.ProfileContext}>
            <strong className={styles.ProfileName}><UserTag username={props.username} address={props.account} colorReversed/></strong>
            <span className={styles.Network}>L16 testnet</span>
          </div>
        </div>
        <div className={styles.MyProfile} onClick={() => goTo(`/Profile/${props.account}`)}>
          <button className={'btn btn-dark'}>My profile</button>
        </div>
        <div className={styles.DropdownButtons}>
          <div className={styles.Balance}>
            <img src={miniLogoLukso.src} alt={''}/>
            <span>{props.balance.slice(0, 7)} {NATIVE_TOKEN}</span>
          </div>
          <div className={styles.TopButtons}>
            <button className={'btn btn-secondary'}><a onClick={() => goTo(EXPLORER_URL + 'address/' + props.account)}>Explorer</a></button>
            <button className={'btn btn-secondary'} onClick={() => setShowNoUpCloud(true)}>UP.cloud</button>
          </div>
          <button className={'btn btn-main'}>Disconnect</button>
        </div>
      </div>
    </>
  );
}

export default ProfileDropdown;
