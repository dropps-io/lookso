import React, {FC, useState} from 'react';
import styles from './Navbar.module.scss';
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/images/logo.png";
import miniLogoLukso from "../../assets/images/logo_lukso_mini.png";
import {connectWeb3} from "../../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {shortenAddress} from "../../core/utils/address-formating";
import {EXPLORER_URL, IPFS_GATEWAY, NATIVE_TOKEN} from "../../environment/endpoints";
import {formatUrl} from "../../core/utils/url-formating";
import {setProfileInfo} from "../../store/profile-reducer";
import Link from "next/link";
import UserTag from "../UserTag/UserTag";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const account: string = useSelector((state: RootState) => state.web3.account);
  const balance: string = useSelector((state: RootState) => state.web3.balance);
  const username: string = useSelector((state: RootState) => state.profile.name);
  const profileImage: string = useSelector((state: RootState) => state.profile.profileImage);

  async function connectToWeb3() {
    const web3Info = await connectWeb3();

    if (web3Info) {
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
    }
  }

  return (
    <div className={styles.Navbar} data-testid="Navbar">
      <Link href='/'>
        <div className={styles.Logo}>
          <img src={logo.src} alt="Logo"/>
        </div>
      </Link>
      <div className={styles.Search}>
        <SearchBar></SearchBar>
      </div>
      <ul className={styles.Buttons}>
        <li><a href="">Discord</a></li>
        <li><a href="">F.A.Q</a></li>
        <li><Link href='/feed'><a href="">Feed</a></Link></li>
        {
          account ?
            <li className={styles.Profile}>
              {
                profileImage ?
                  <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}></div>
                  :
                  <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall}></div>
              }
              <div className={`${styles.ProfileDropdown} ${!showDropdown ? styles.InactiveDropdown : ''}`}>
                <div className={styles.DropdownHeader}>
                  <Link href={`/Profile/${account}`}>
                  {
                    profileImage ?
                      <div className={styles.ProfilePicMedium} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}/>
                      :
                      <div className={styles.ProfilePicMedium}/>
                  }
                  </Link>
                  <Link href={`/Profile/${account}`}>
                  <div className={styles.ProfileContext}>
                    <strong>{ shortenAddress(account, 3) }</strong>
                    <span>L16 Testnet</span>
                  </div>
                  </Link>
                </div>
                <p className={styles.ProfileName}><UserTag username={username} address={account} colorReversed/></p>
                <div className={styles.Balance}>
                  <img src={miniLogoLukso.src} alt={''}/>
                  <span>{balance.slice(0, 7)} {NATIVE_TOKEN}</span>
                </div>
                <div className={styles.DropdownButtons}>
                  <div className={styles.TopButtons}>
                    <button className={'btn btn-secondary'}><a href={EXPLORER_URL + 'address/' + account} target='_blank' rel="noopener noreferrer">Explorer</a></button>
                    <button className={'btn btn-secondary'}>UP.cloud</button>
                  </div>
                  <button className={'btn btn-main'}>Disconnect</button>
                </div>
              </div>
            </li>
            :
            <li className={styles.ImportantBtn} onClick={() => {connectToWeb3()}}>
              <a>Login</a>
            </li>
        }
      </ul>
    </div>
  );
}

export default Navbar;
