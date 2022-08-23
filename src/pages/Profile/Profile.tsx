import React, {FC, useEffect, useState} from 'react';
import styles from './Profile.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL} from "../../environment/endpoints";
import chainIcon from '../../assets/icons/chain.svg';
import {shortenAddress} from "../../core/utils/address-formating";
import {fetchIsProfileFollower,
  fetchProfileActivity,
  fetchProfileFollowersCount,
  fetchProfileFollowingCount,
  fetchProfileInfo,
  insertFollow,
  insertUnfollow
} from "../../core/api";
import {connectToAPI} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {FeedPost} from "../../components/PostBox/PostBox";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../../components/UserTag/UserTag";
import Head from "next/head";
import {POSTS_PER_LOAD} from "../../environment/constants";

interface ProfileProps {
  address: string
}

const Profile: FC<ProfileProps> = (props) => {
  const dispatch = useDispatch();
  const connected = {
    account: useSelector((state: RootState) => state.web3.account),
    username: useSelector((state: RootState) => state.profile.name),
    profileImage: useSelector((state: RootState) => state.profile.profileImage),
    backgroundImage: useSelector((state: RootState) => state.profile.backgroundImage),
  }
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);

  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);
  const [copied, setCopied] = useState([false, false]);
  const [fullyLoadedActivity, setFullyLoadedActivity] = useState(false);
  const [offset, setOffset] = useState(POSTS_PER_LOAD);

  let loading = false;

  useEffect(() => {
    async function initPageData() {
      setFeed([]);
      setFollowing(await fetchProfileFollowingCount(props.address));
      setFollowers(await fetchProfileFollowersCount(props.address));

      if (connected.account === props.address) {
        await initConnectedAccount();
      } else if (props.address && props.address.length === 42) {
        await initProfile();
      } else {
      }
      setFeed(await fetchProfileActivity(props.address, POSTS_PER_LOAD, 0));
    }

    async function initProfile() {
      setAccount(props.address);
      const profileData = await fetchProfileInfo(props.address);
      setUsername(profileData.name);
      setProfileImage(profileData.profileImage);
      setBackgroundImage(profileData.backgroundImage);
      setIsFollowing(await fetchIsProfileFollower(props.address, connected.account));
    }

    async function initConnectedAccount() {
      setAccount(connected.account);
      setUsername(connected.username);
      setProfileImage(connected.profileImage);
      setBackgroundImage(connected.backgroundImage);
    }

    initPageData();
  }, [props.address, connected.account]);

  async function requestJWT() {
    const resJWT = await connectToAPI(connected.account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  function copyToClipboard(toCopy: string, index: number) {
    setCopied(existing => existing.map((e, i) => i === index));
    navigator.clipboard.writeText(toCopy);
    setTimeout(() => {
      setCopied(existing => existing.map(() => false));
    }, 500);
  }

  async function followUser() {
    setIsFollowing(true);
    setFollowers(existing => existing + 1);
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      await insertFollow(connected.account, account, headersJWT);
    }
    catch (e) {
      console.error(e);
      setIsFollowing(false);
    }
  }

  async function unfollowUser() {
    setIsFollowing(false);
    setFollowers(existing => existing - 1);
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      await insertUnfollow(connected.account, account, headersJWT);
    }
    catch (e) {
      console.error(e);
      setIsFollowing(true);
    }
  }

  function openExplorer(address: string) {
    window.open ( EXPLORER_URL + '/address/' + address, '_blank');
  }

  async function loadMorePosts() {
    if (loading || fullyLoadedActivity) return;
    console.log('Loading new posts from offset ' + offset);
    try {
      loading = true;
      let newPosts = await fetchProfileActivity(props.address, POSTS_PER_LOAD, offset);
      newPosts = newPosts.filter(post => !feed.map(p => p.hash).includes(post.hash));
      setFeed((existing: FeedPost[]) => existing.concat(newPosts));
      if (newPosts.length === 0) setFullyLoadedActivity(true);
      loading = false;
      setOffset(existing => existing + POSTS_PER_LOAD);
    }
    catch (e) {
      console.error(e);
      loading = false;
    }
    console.log(feed);
  }

  return (
    <div className={styles.Profile} data-testid="Profile">
      <Head>
        <title>{`@${username ? username : 'unnamed'}#${account.slice(2, 6).toUpperCase()}`} | Lookso</title>
      </Head>
      <div className={styles.ProfilePageHeader}>
        <Navbar/>
      </div>
       <div className={styles.ProfilePageContent}>
         <div className={styles.BackgroundImage} style={ backgroundImage ? { backgroundImage: `url(${formatUrl(backgroundImage)})`} : {backgroundColor: `#${(account.slice(2, 8))}`}}></div>
         <div className={styles.ProfileBasicInfo}>
           <span className={styles.UserTag}>
             <UserTag onClick={() => copyToClipboard(`@${username ? username : 'unnamed'}#${account.slice(2, 6).toUpperCase()}`, 0)} username={username} address={account} />
             <span className={`copied ${copied[0] ? 'copied-active' : ''}`}>Copied to clipboard</span>
           </span>
           <div className={styles.ProfileImage} style={{backgroundImage: profileImage ? `url(${formatUrl(profileImage)})` : `url(${DEFAULT_PROFILE_IMAGE})`}}></div>
           <div className={styles.ProfileAddress}>
             <img onClick={() => openExplorer(account)} src={chainIcon.src} alt=""/>
             <span onClick={() => openExplorer(account)}>{shortenAddress(account, 3)}</span>
           </div>
           {
             connected.account && props.address !== connected.account ?
               <div className={styles.ProfileButtons}>
                 {
                   isFollowing ?
                     <button onClick={unfollowUser} className={'btn btn-secondary-no-fill'}>Following</button>
                     :
                     <button onClick={followUser} className={'btn btn-secondary'}>Follow</button>
                 }
                 <button className={'btn btn-secondary-no-fill'}>...</button>
               </div>
               :
               <></>
           }
         </div>
         <span className={styles.UserTagMobile}>
             <UserTag onClick={() => copyToClipboard(`@${username ? username : 'unnamed'}#${account.slice(2, 6).toUpperCase()}`, 0)} username={username} address={account} />
             <span className={`copied ${copied[0] ? 'copied-active' : ''}`}>Copied to clipboard</span>
           </span>
         <div className={styles.ProfileAddressMobile}>
           <img onClick={() => openExplorer(account)} src={chainIcon.src} alt=""/>
           <span onClick={() => openExplorer(account)}>{shortenAddress(account, 3)}</span>
         </div>
         <div className={styles.ProfileInfluence}>
           <div className={styles.ProfileFollow}>
             <strong>{following}</strong>
             <span>Following</span>
           </div>
           <div className={styles.Sep}></div>
           <div className={styles.ProfileFollow}>
             <strong>{followers}</strong>
             <span>Followers</span>
           </div>
         </div>
         {
           connected.account && props.address !== connected.account ?
             <div className={styles.ProfileButtons}>
               {
                 isFollowing ?
                   <button onClick={unfollowUser} className={'btn btn-secondary-no-fill'}>Following</button>
                   :
                   <button onClick={followUser} className={'btn btn-secondary'}>Follow</button>
               }
               <button className={'btn btn-secondary-no-fill'}>...</button>
             </div>
             :
             <></>
         }
         <div className={styles.Activity}>
           <Activity headline='Activity' feed={feed} loadNext={loadMorePosts}></Activity>
         </div>
       </div>
      <Footer/>
    </div>
  );
}

export default Profile;
