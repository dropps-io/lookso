import React, {FC, useEffect, useState} from 'react';
import styles from './Navbar.module.scss';
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/icons/logo.svg";
import burgerMenuIcon from "../../assets/icons/burger-menu.svg";
import crossIcon from "../../assets/icons/cross.svg";
import searchIcon from "../../assets/icons/search.svg";
import bellIcon from "../../assets/icons/bell.svg";
import bellIconFilled from "../../assets/icons/bell-filled.svg";
import {connectToAPI, connectWeb3} from "../../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {formatUrl} from "../../core/utils/url-formating";
import {setProfileInfo, setProfileJwt} from "../../store/profile-reducer";
import Link from "next/link";
import {fetchProfileNotificationsCount} from "../../core/api";
import NotificationsModal from "../Modals/NotificationsModal/NotificationsModal";
import Web3 from "web3";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
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
      await requestJWT(web3Info.account, web3Info.web3);
    }
  }

  async function requestJWT(account: string, web3: Web3) {
    const resJWT = await connectToAPI(account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  function displayNotifications() {
    setNotificationsCount(0);
    setShowNotificationsModal(true);
  }

  useEffect(() => {
    const init = async () => {
      if (account) setNotificationsCount(await fetchProfileNotificationsCount(account));
    }

    init();
  }, [account]);

  return (
    <div className={styles.Navbar} data-testid="Navbar">
      <NotificationsModal account={account} open={showNotificationsModal} onClose={() => setShowNotificationsModal(false)}/>
      <Link href='/'>
        <div className={styles.Logo}>
          <img src={logo.src} alt="Logo"/>
        </div>
      </Link>
      <div className={styles.SearchIcon}>
        <img src={searchIcon.src} alt="Search"/>
      </div>
      <div className={styles.Search}>
        <SearchBar></SearchBar>
      </div>
      <ul className={styles.Buttons}>
        {
          account ?
            <></>
            :
            <li><a href="">Discord</a></li>
        }
        <li><Link href='/explore'><a href="">Explore</a></Link></li>
        {
          account ?
            <li><Link href='/feed'><a href="">My feed</a></Link></li>
            :
            <></>
        }
        {
          account ?
            <li>
              <a className={styles.Notifications} onClick={() => displayNotifications()}>
                {
                  notificationsCount > 0 ?
                    <>
                      <img className={styles.BellIcon} src={bellIconFilled.src} alt=""/>
                      <div className={styles.NotificationsCount}>{notificationsCount}</div>
                    </>
                    :
                    <img className={styles.BellIcon} src={bellIcon.src} alt=""/>
                }
              </a>
            </li> : <></>
        }
        {
          account ?
            <li className={styles.Profile}>
              {
                profileImage ?
                  <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall} style={{backgroundImage: `url(${formatUrl(profileImage)})`}}></div>
                  :
                  <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall}></div>
              }
              <ProfileDropdown showDropdown={showDropdown} account={account} username={username} profileImage={profileImage} balance={balance}/>
            </li>
            :
            <li className={styles.ImportantBtn} onClick={() => {connectToWeb3()}}>
              <a>Login</a>
            </li>
        }
      </ul>
      <div className={styles.BurgerMenu}>
        {
          showBurgerMenu ?
          <img onClick={() => setShowBurgerMenu(false)} src={crossIcon.src} alt=""/>
          :
          <img onClick={() => setShowBurgerMenu(true)} src={burgerMenuIcon.src} alt=""/>
        }
        <div className={`${styles.Menu} ${showBurgerMenu ? styles.ShowMenu : ''}`}>
          <ul className={styles.Buttons}>
            <li><a href="">Home</a></li>
            {
              account ?
                <></>
                :
                <li><a href="">Discord</a></li>
            }
            <li><Link href='/explore'><a href="">Explore</a></Link></li>
            {
              account ?
                <li><Link href='/feed'><a href="">My feed</a></Link></li>
                :
                <></>
            }
            {
              account ?
                <li><Link href=''><a className={styles.Notifications} href="">Notifications</a></Link></li> : <></>
            }
            {
              account ?
                <li className={styles.Profile}>
                  {
                    profileImage ?
                      <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall} style={{backgroundImage: `url(${formatUrl(profileImage)})`}}></div>
                      :
                      <div onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall}></div>
                  }
                  <ProfileDropdown showDropdown={showDropdown} account={account} username={username} profileImage={profileImage} balance={balance}/>
                </li>
                :
                <li className={styles.ImportantBtn} onClick={() => {connectToWeb3()}}>
                  <a>Login</a>
                </li>
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
