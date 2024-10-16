import React, { type FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';

import styles from './Navbar.module.scss';
import SearchBar from '../SearchBar/SearchBar';
import logo from '../../assets/icons/logo.svg';
import burgerMenuIcon from '../../assets/icons/burger-menu.svg';
import crossIcon from '../../assets/icons/cross.svg';
import searchIcon from '../../assets/icons/search.svg';
import bellIcon from '../../assets/icons/bell.svg';
import bellIconFilled from '../../assets/icons/bell-filled.svg';
import { connectWeb3 } from '../../core/web3';
import { setAccount, setBalance, setNetworkId, setWeb3 } from '../../store/web3-reducer';
import { getFeedActions, type RootState } from '../../store/store';
import { formatUrl } from '../../core/utils/url-formating';
import { setProfileInfo } from '../../store/profile-reducer';
import { fetchProfileNotificationsCount } from '../../core/api/api';
import NotificationsModal from '../Modals/NotificationsModal/NotificationsModal';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import ActionModal from '../Modals/ActionModal/ActionModal';

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showUpInstallationModal, setShowUpInstallationModal] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const account: string | undefined = useSelector((state: RootState) => state.web3.account);
  const balance: string = useSelector((state: RootState) => state.web3.balance);
  const username: string = useSelector((state: RootState) => state.profile.name);
  const profileImage: string = useSelector((state: RootState) => state.profile.profileImage);

  async function connectToWeb3() {
    let web3Info;
    try {
      web3Info = await connectWeb3();
    } catch (e: any) {
      console.error(e.message);
      dispatch(setAccount(''));
      if ((e.message as string).includes('Provider')) setShowUpInstallationModal(true);
      return;
    }

    if (web3Info != null) {
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
      // TODO go to feed only if on the home, but manage to make the explore page stay when logging in
      await router.push('/feed');
    }
  }

  function displayNotifications() {
    setShowBurgerMenu(false);
    setNotificationsCount(0);
    setShowNotificationsModal(true);
  }

  function goToUpInstallationGuide() {
    window.open(
      'https://docs.lukso.tech/guides/browser-extension/install-browser-extension/',
      '_blank'
    );
    setShowUpInstallationModal(false);
  }

  function goTo(url: string) {
    window.open(url, '_blank');
  }

  async function goToRoute(route: string) {
    if (router.asPath.includes('explore') && route.includes('explore')) {
      dispatch(getFeedActions('Explore').setCurrentPage(undefined));
      dispatch(getFeedActions('Explore').setStoredFeed([]));
    }
    if (router.asPath.includes('feed') && route.includes('feed')) {
      dispatch(getFeedActions('Feed').setCurrentPage(undefined));
      dispatch(getFeedActions('Feed').setStoredFeed([]));
    }
    await router.push(route);
  }

  useEffect(() => {
    const init = async () => {
      if (account) setNotificationsCount(await fetchProfileNotificationsCount(account));
    };

    init();
  }, [account]);

  return (
    <>
      {(showMobileSearchBar || showBurgerMenu) && (
        <div
          className="backdrop"
          onClick={() => {
            setShowMobileSearchBar(false);
            setShowBurgerMenu(false);
          }}
        ></div>
      )}
      <ActionModal
        open={showUpInstallationModal}
        onClose={() => {
          setShowUpInstallationModal(false);
        }}
        textToDisplay={'Universal Profile not detected'}
        btnText={'Go to docs.lukso.tech'}
        callback={goToUpInstallationGuide}
      />
      <div className={styles.Navbar} data-testid="Navbar">
        <NotificationsModal
          account={account || ''}
          open={showNotificationsModal}
          onClose={() => {
            setShowNotificationsModal(false);
          }}
        />
        <Link href="/">
          <div className={styles.Logo}>
            <img src={logo.src} alt="Lookso logo" />
          </div>
        </Link>
        <div
          className={styles.SearchIcon}
          onClick={() => {
            setShowMobileSearchBar(true);
          }}
        >
          <img src={searchIcon.src} alt="Search" />
        </div>
        <div className={styles.Search}>
          <SearchBar></SearchBar>
        </div>
        {router.asPath === '/' || router.asPath === '' ? (
          <></>
        ) : (
          <Link href={account ? '/feed' : '/explore'}>
            <span className={styles.Title}>LOOKSO</span>
          </Link>
        )}
        <ul className={styles.Buttons}>
          {account ? (
            <></>
          ) : (
            <>
              <li>
                <a
                  onClick={() => {
                    goTo('https://discord.gg/2eDkpwbK9w');
                  }}
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    goTo('https://twitter.com/lookso_io');
                  }}
                >
                  Twitter
                </a>
              </li>
            </>
          )}
          <li>
            <a
              onClick={async () => {
                await goToRoute('/explore');
              }}
              className={router.asPath.includes('explore') ? styles.ActiveLink : ''}
            >
              Explore
            </a>
          </li>
          {account ? (
            <li>
              <a
                onClick={async () => {
                  await goToRoute('/feed');
                }}
                className={router.asPath.includes('feed') ? styles.ActiveLink : ''}
              >
                My feed
              </a>
            </li>
          ) : (
            <></>
          )}
          {account ? (
            <li>
              <a
                className={styles.Notifications}
                onClick={() => {
                  displayNotifications();
                }}
              >
                {notificationsCount > 0 ? (
                  <>
                    <img className={styles.BellIcon} src={bellIconFilled.src} alt="" />
                    <div className={styles.NotificationsCount}>{notificationsCount}</div>
                  </>
                ) : (
                  <img className={styles.BellIcon} src={bellIcon.src} alt="" />
                )}
              </a>
            </li>
          ) : (
            <></>
          )}
          {account ? (
            <li className={styles.Profile}>
              {profileImage ? (
                <div
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                  }}
                  className={styles.ProfilePicSmall}
                  style={{ backgroundImage: `url(${formatUrl(profileImage)})` }}
                ></div>
              ) : (
                <div
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                  }}
                  className={styles.ProfilePicSmall}
                ></div>
              )}
              <ProfileDropdown
                onClose={() => {
                  setShowDropdown(false);
                }}
                showDropdown={showDropdown}
                account={account}
                username={username}
                profileImage={profileImage}
                balance={balance}
              />
            </li>
          ) : (
            <li
              className={styles.ImportantBtn}
              onClick={() => {
                connectToWeb3();
              }}
            >
              <a>Login</a>
            </li>
          )}
        </ul>
        <div className={styles.BurgerMenu}>
          {showBurgerMenu ? (
            <img
              onClick={() => {
                setShowBurgerMenu(false);
              }}
              src={crossIcon.src}
              alt=""
            />
          ) : (
            <img
              onClick={() => {
                setShowBurgerMenu(true);
              }}
              src={burgerMenuIcon.src}
              alt=""
            />
          )}
          <div className={`${styles.Menu} ${showBurgerMenu ? styles.ShowMenu : ''}`}>
            <ul className={styles.Buttons}>
              <li>
                <Link href={'/'}>
                  <a href="">Home</a>
                </Link>
              </li>
              {account ? (
                <></>
              ) : (
                <>
                  <li>
                    <a
                      onClick={() => {
                        goTo('https://discord.gg/2eDkpwbK9w');
                      }}
                    >
                      Discord
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        goTo('https://twitter.com/dropps_io');
                      }}
                    >
                      Twitter
                    </a>
                  </li>
                </>
              )}
              <li>
                <a
                  onClick={async () => {
                    await goToRoute('/explore');
                  }}
                  href=""
                  className={router.asPath.includes('explore') ? styles.ActiveLink : ''}
                >
                  Explore
                </a>
              </li>
              {account ? (
                <li>
                  <a
                    onClick={async () => {
                      await goToRoute('/feed');
                    }}
                    href=""
                    className={router.asPath.includes('feed') ? styles.ActiveLink : ''}
                  >
                    My feed
                  </a>
                </li>
              ) : (
                <></>
              )}
              {account ? (
                <li>
                  <a
                    className={styles.Notifications}
                    onClick={() => {
                      displayNotifications();
                    }}
                  >
                    Notifications
                  </a>
                </li>
              ) : (
                <></>
              )}
              {account ? (
                <li className={styles.Profile}>
                  {profileImage ? (
                    <div
                      onClick={() => {
                        setShowDropdown(!showDropdown);
                      }}
                      className={styles.ProfilePicSmall}
                      style={{ backgroundImage: `url(${formatUrl(profileImage)})` }}
                    ></div>
                  ) : (
                    <div
                      onClick={() => {
                        setShowDropdown(!showDropdown);
                      }}
                      className={styles.ProfilePicSmall}
                    ></div>
                  )}
                  <ProfileDropdown
                    onClose={() => {
                      setShowDropdown(false);
                    }}
                    showDropdown={showDropdown}
                    account={account}
                    username={username}
                    profileImage={profileImage}
                    balance={balance}
                  />
                </li>
              ) : (
                <li
                  className={styles.ImportantBtn}
                  onClick={() => {
                    connectToWeb3();
                  }}
                >
                  <a>Login</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div
        className={`${styles.MobileSearchBar} ${
          showMobileSearchBar ? styles.MobileSearchBarActive : ''
        }`}
      >
        <SearchBar
          onClose={() => {
            setShowMobileSearchBar(false);
          }}
          noBorder
        />
      </div>
    </>
  );
};

export default Navbar;
