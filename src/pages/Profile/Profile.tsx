import React, {FC, useEffect, useState} from 'react';
import styles from './Profile.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {formatUrl} from "../../core/utils/url-formating";
import {IPFS_GATEWAY} from "../../environment/endpoints";
import chainIcon from '../../assets/icons/chain.svg';
import heartIcon from '../../assets/icons/heart.svg';
import commentIcon from '../../assets/icons/comment.svg';
import shareIcon from '../../assets/icons/share.svg';
import repostIcon from '../../assets/icons/repost.svg';
import externalLinkIcon from '../../assets/icons/external-link.svg';
import executedEventIcon from '../../assets/icons/events/executed.png';
import {shortenAddress} from "../../core/utils/address-formating";
import {fetchIsProfileFollower, fetchProfileFollowersCount, fetchProfileFollowingCount, fetchProfileInfo} from "../../core/api";

interface ProfileProps {
  address: string
}

const Profile: FC<ProfileProps> = (props) => {
  const connected = {
    account: useSelector((state: RootState) => state.web3.account),
    username: useSelector((state: RootState) => state.profile.name),
    profileImage: useSelector((state: RootState) => state.profile.profileImage),
    backgroundImage: useSelector((state: RootState) => state.profile.backgroundImage),
  }
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    initPageData();
  });

  async function initPageData() {
    setFollowing(await fetchProfileFollowingCount(account));
    setFollowers(await fetchProfileFollowersCount(account));

    if (connected.account === props.address) {
      await initConnectedAccount();
    } else if (props.address && props.address.length === 42) {
      await initProfile();
    } else {
      setError(true);
    }
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
                   <button className={'btn btn-secondary-no-fill'}>Following</button>
                   :
                   <button className={'btn btn-secondary'}>Follow</button>
               }
               <button className={'btn btn-secondary-no-fill'}>...</button>
             </div>
             :
             <></>
         }
         <div className={styles.Feed}>
           <div className={styles.FeedHeader}>
             <h5>Activity</h5>
           </div>
           <div className={styles.FeedPosts}>
             <div className={styles.FeedPost}>
               <div className={styles.PostHeader}>
                 <div className={styles.LeftPart}>
                   <div className={styles.ProfileImageMedium} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}></div>
                   <div className={styles.UserTag}>@samuel-v<span>#0101</span></div>
                 </div>
                 <div className={styles.RightPart}>
                   <span>2h Ago</span>
                   <img src={externalLinkIcon.src} alt=""/>
                 </div>
               </div>
               <div className={styles.PostTags}>
                 <div className={styles.PostTag}>LSP7</div>
                 <div className={styles.PostTag}>Token</div>
                 {/*TODO add copies tag*/}
                 {/*<div className={styles.PostTag}>*/}
                 {/*  <img src="" alt=""/>*/}
                 {/*  <span>20</span>*/}
                 {/*</div>*/}
               </div>
               <div className={styles.PostContent}>
                 <img src={executedEventIcon.src} alt="Executed Event"/>
                 <p>Executed an unknown function</p>
               </div>
               <div className={styles.PostFooter}>
                 <div></div>
                 <div className={styles.PostActions}>
                   <div className={styles.IconNumber}>
                     <img src={commentIcon.src} alt=""/>
                     <span>132</span>
                   </div>
                   <div className={styles.IconNumber}>
                     <img src={repostIcon.src} alt=""/>
                     <span>132</span>
                   </div>
                   <div className={styles.IconNumber}>
                     <img src={heartIcon.src} alt=""/>
                     <span>132</span>
                   </div>
                 </div>
                 <img className={styles.PostShare} src={shareIcon.src} alt=""/>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
}

export default Profile;
