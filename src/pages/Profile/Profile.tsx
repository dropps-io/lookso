import React, {FC, useEffect, useState} from 'react';
import styles from './Profile.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {formatUrl} from "../../core/utils/url-formating";
import {IPFS_GATEWAY} from "../../environment/endpoints";
import chainIcon from '../../assets/icons/chain.svg';
import {shortenAddress} from "../../core/utils/address-formating";
import {
  fetchIsProfileFollower, fetchProfileActivity,
  fetchProfileFollowersCount,
  fetchProfileFollowingCount,
  fetchProfileInfo,
  insertFollow,
  insertUnfollow
} from "../../core/api";
import {connectToAPI} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import {FeedPost} from "../../models/post";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";

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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initPageData() {
      setFollowing(await fetchProfileFollowingCount(props.address));
      setFollowers(await fetchProfileFollowersCount(props.address));

      if (connected.account === props.address) {
        await initConnectedAccount();
      } else if (props.address && props.address.length === 42) {
        await initProfile();
      } else {
        setError(true);
      }
      setFeed(await fetchProfileActivity(props.address, 30, 0));
      setLoading(false);
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
  }, [props.address,connected.account]);

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

  return (
    <div className={styles.Profile} data-testid="Profile">
      <div className={styles.ProfilePageHeader}>
        <Navbar/>
      </div>
       <div className={styles.ProfilePageContent}>
         <div className={styles.BackgroundImage} style={{backgroundImage: `url(${formatUrl(backgroundImage, IPFS_GATEWAY)})`}}></div>
         <div className={styles.ProfileBasicInfo}>
           <span className={styles.UserTag}>@{username}<span>#{account.slice(2, 6)}</span></span>
           <div className={styles.ProfileImage} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}></div>
           <div className={styles.ProfileAddress}>
             <img src={chainIcon.src} alt=""/>
             <span>{shortenAddress(account, 3)}</span>
           </div>
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
           props.address !== connected.account ?
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
         <Activity feed={feed}></Activity>
       </div>
      <Footer/>
    </div>
  );
}

export default Profile;
