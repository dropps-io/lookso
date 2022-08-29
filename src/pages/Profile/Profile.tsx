import React, {FC, useEffect, useState} from 'react';
import styles from './Profile.module.scss';
import blockIcon from '../../assets/icons/block.svg'
import reportIcon from '../../assets/icons/report.svg'
import shareIcon from '../../assets/icons/share.svg'

import Navbar from "../../components/Navbar/Navbar";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL, WEBSITE_URL} from "../../environment/endpoints";
import chainIcon from '../../assets/icons/chain.svg';
import {shortenAddress} from "../../core/utils/address-formating";
import {
  fetchIsProfileFollower,
  fetchProfileActivity,
  fetchProfileFollowersCount,
  fetchProfileFollowingCount,
  insertFollow,
  insertUnfollow, requestNewRegistryJsonUrl, setNewRegistryPostedOnProfile
} from "../../core/api";
import {connectToAPI} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {FeedPost} from "../../components/PostBox/PostBox";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../../components/UserTag/UserTag";
import {POSTS_PER_LOAD} from "../../environment/constants";
import {ProfileInfo} from "../../models/profile";
import LoadingModal from "../../components/Modals/LoadingModal/LoadingModal";
import {updateRegistry} from "../../core/update-registry";
import MoreInfo from "../../components/MoreInfo/MoreInfo";
import ExtendImage from "../../components/ExtendImage/ExtendImage";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";
import FollowModal from "../../components/Modals/FollowModal/FollowModal";
import ActionModal from "../../components/Modals/ActionModal/ActionModal";

interface ProfileProps {
  address: string,
  profileInfo: ProfileInfo,
  userTag: string
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

  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  // extra button with "report" and "block" user
  const [isOpenExtraAction, setIsOpenExtraAction] = useState(false);
  const [isOpenFollowModal, setIsOpenFollowModal] = useState<'' | 'followers' | 'following'>('');

  const [feed, setFeed]: [FeedPost[], any] = useState([]);
  const [copied, setCopied] = useState([false, false]);
  const [fullyLoadedActivity, setFullyLoadedActivity] = useState(false);
  const [offset, setOffset] = useState(POSTS_PER_LOAD);
  const [bgColor, setBgColor] = useState('fff');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedLoading, setFeedLoading] = useState(false);

  const [isExtendProfileImage, setIsExtendProfileImage] = useState(false);
  const [isExtendBannerImage, setIsExtendBannerImage] = useState(false);
  const [isOpenFeatureSoonModal, setIsOpenFeatureSoonModal] = useState(false);


  let loading = false;

  useEffect(() => {
    if (props.address) setBgColor(props.address.slice(2, 6));
    async function initPageData() {
      setFeed([]);
      setFeedLoading(true);
      setFollowing(await fetchProfileFollowingCount(props.address));
      setFollowers(await fetchProfileFollowersCount(props.address));

      if (connected.account === props.address) {
      } else if (props.address && props.address.length === 42) {
        await initProfile();
      } else {
      }
      await fetchPosts('all');
    }

    async function initProfile() {
      setIsFollowing(await fetchIsProfileFollower(props.address, connected.account));
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
      try {
        const res: any = await insertFollow(connected.account, props.address, headersJWT);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(headersJWT, res.jsonUrl);
      } catch (e: any) {
        setIsFollowing(false);
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain(headersJWT)
        }
      }
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
      try {
        const res: any  = await insertUnfollow(connected.account, props.address, headersJWT);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(headersJWT, res.jsonUrl);
      } catch (e: any) {
        setIsFollowing(true);
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain(headersJWT)
        }
      }
    }
    catch (e) {
      console.error(e);
      setIsFollowing(true);
    }
  }

  async function pushRegistryToTheBlockchain(_jwt: string, jsonUrl?: string) {
    setLoadingMessage('It\'s time to push everything to the blockchain! ⛓️')

    try {
      const JSONURL = jsonUrl ? jsonUrl : (await requestNewRegistryJsonUrl(connected.account, _jwt)).jsonUrl
      await updateRegistry(connected.account, JSONURL, web3);
      await setNewRegistryPostedOnProfile(connected.account, _jwt);
      setLoadingMessage('');
    } catch (e) {
      setLoadingMessage('');
    }
  }

  function openExplorer(address: string) {
    window.open ( EXPLORER_URL + '/address/' + address, '_blank');
  }

  async function loadMorePosts(filter: 'all' | 'post' | 'event') {
    if (loading || feedLoading || fullyLoadedActivity) return;
    setFeedLoading(true);
    // console.log('Loading new posts from offset ' + offset);
    try {
      loading = true;
      let newPosts = await fetchProfileActivity(props.address, POSTS_PER_LOAD, offset, filter === 'all' ? undefined : filter, connected.account);
      newPosts = newPosts.filter(post => !feed.map(p => p.hash).includes(post.hash));
      setFeed((existing: FeedPost[]) => existing.concat(newPosts));
      if (newPosts.length === 0) setFullyLoadedActivity(true);
      setOffset(existing => existing + POSTS_PER_LOAD);
      loading = false;
      setFeedLoading(false);
    }
    catch (e) {
      console.error(e);
      loading = false;
      setFeedLoading(false);
    }
  }

  async function fetchPosts(filter: 'all' | 'post' | 'event') {
    setFeedLoading(true);
    setFeed([]);
    const newPosts = await fetchProfileActivity(props.address, POSTS_PER_LOAD, 0, filter !== 'all' ? filter : undefined, connected.account);
    setFullyLoadedActivity(false);
    setOffset(newPosts.length);
    setFeed(newPosts);
    setFeedLoading(false);
  }

  async function reportUser() {
    setIsOpenExtraAction(false);
    setIsOpenFeatureSoonModal(true)
    // TODO add api call
  }
  async function blockUser() {
    setIsOpenExtraAction(false);
    setIsOpenFeatureSoonModal(true)
    // TODO add api call
  }

  function shareOnTwitter() {
    setIsOpenExtraAction(false);
    const content: string = `Checkout ${connected.account === props.address ? 'my' : 'this'} Universal Profile on @lookso_io! \n\n${WEBSITE_URL}/Profile/${props.address}`
    window.open(  'https://twitter.com/intent/tweet?text=' + content, '_blank');
  }

  function onClickCloseExtendImage() {
    setIsExtendProfileImage(false)
    setIsExtendBannerImage(false)
  }

  function handleFollowChange(type: 'followers' | 'following', value: -1 | 1) {
    if (type === 'followers') setFollowers(followers + value);
    else setFollowing(following + value);
  }

  return (
    <>
      <ActionModal open={isOpenFeatureSoonModal} onClose={() => setIsOpenFeatureSoonModal(false)} textToDisplay={"Sorry, this functionality will be added soon!"} btnText={"Close"} callback={() => setIsOpenFeatureSoonModal(false)}/>
      <FollowModal connectedAccount={connected.account} onFollowChange={handleFollowChange} onPushToBlockchainRequired={pushRegistryToTheBlockchain} account={props.address} type='followers' open={isOpenFollowModal === 'followers'} onClose={() => setIsOpenFollowModal('')}/>
      <FollowModal connectedAccount={connected.account} onFollowChange={handleFollowChange} onPushToBlockchainRequired={pushRegistryToTheBlockchain} account={props.address} type={'following'} open={isOpenFollowModal === 'following'} onClose={() => setIsOpenFollowModal('')}/>
      <LoadingModal open={!!loadingMessage} onClose={() => {}} textToDisplay={loadingMessage}/>
      {
        isOpenExtraAction && <div className='backdrop' onClick={() => setIsOpenExtraAction(false)}/>
      }
      <div className={styles.Profile} data-testid="Profile">
        <SidebarButtons/>
        <div className={styles.ProfilePageHeader}>
          <Navbar/>
        </div>
        <div className={styles.ProfilePageContent}>
          <div onClick={() => setIsExtendBannerImage(false)} className={`${styles.BackgroundImage} ${props.profileInfo?.backgroundImage && styles.BackgroundImageClick}`} style={ props.profileInfo?.backgroundImage ? { backgroundImage: `url(${formatUrl(props.profileInfo?.backgroundImage)})`} : {backgroundColor: `#${bgColor}`}}></div>
          {
              isExtendBannerImage && props.profileInfo.backgroundImage && <ExtendImage image={props.profileInfo?.backgroundImage} alt={`Banner of user ${props.profileInfo.name}`} callback={onClickCloseExtendImage} rounded={false}/>
          }
          <div className={styles.ProfileBasicInfo}>
           <span className={styles.UserTag}>
             <UserTag onClick={() => copyToClipboard(props.userTag, 0)} username={props.profileInfo?.name ? props.profileInfo?.name : ''} address={props.address} />
             <span className={`copied ${copied[0] ? 'copied-active' : ''}`}>Copied to clipboard</span>
           </span>
            <div onClick={() => setIsExtendProfileImage(false)} className={styles.ProfileImage} style={{backgroundImage: props.profileInfo?.profileImage ? `url(${formatUrl(props.profileInfo?.profileImage)})` : `url(${DEFAULT_PROFILE_IMAGE})`}}></div>
            {
              isExtendProfileImage && <ExtendImage image={props.profileInfo?.profileImage ? props.profileInfo.profileImage : DEFAULT_PROFILE_IMAGE} alt={`Profile of user ${props.profileInfo.name}`} callback={onClickCloseExtendImage} rounded/>
            }
            <div className={styles.ProfileAddress}>
              <img onClick={() => openExplorer(props.address)} src={chainIcon.src} alt=""/>
              <span onClick={() => openExplorer(props.address)}>{shortenAddress(props.address, 3)}</span>
            </div>

                <div className={styles.ProfileButtons}>
                  {
                    (connected.account && props.address !== connected.account) ?
                      isFollowing ?
                        <button onClick={unfollowUser} className={'btn btn-secondary-no-fill'}>Following</button> :
                        <button onClick={followUser} className={'btn btn-secondary'}>Follow</button>
                      :
                      <></>
                  }
                  <div className={styles.ProfileExtraActions}>
                    <button onClick={() => setIsOpenExtraAction(!isOpenExtraAction)} className={'btn btn-secondary-no-fill'}>...</button>
                    {
                      isOpenExtraAction && (<div className={styles.ExtraActionsPopup}>
                        <span onClick={() => shareOnTwitter()}><img src={shareIcon.src} alt="Share profile"/>Share</span>
                        <span onClick={() => reportUser()}><img src={reportIcon.src} alt="Report user"/>Report</span>
                        <span onClick={() => blockUser()}><img src={blockIcon.src} alt="Block user"/>Block</span>
                      </div>)
                    }
                </div>
                </div>
          </div>
          <span className={styles.UserTagMobile}>
             <UserTag onClick={() => copyToClipboard(props.userTag, 0)} username={props.profileInfo?.name ? props.profileInfo?.name : ''} address={props.address} />
             <span className={`copied ${copied[0] ? 'copied-active' : ''}`}>Copied to clipboard</span>
           </span>
          <div className={styles.ProfileAddressMobile}>
            <img onClick={() => openExplorer(props.address)} src={chainIcon.src} alt=""/>
            <span onClick={() => openExplorer(props.address)}>{shortenAddress(props.address, 3)}</span>
          </div>
          <div className={styles.ProfileInfluence}>
            <div className={styles.ProfileFollow} onClick={() => setIsOpenFollowModal('following')}>
              <strong>{following}</strong>
              <span>Following</span>
            </div>
            <div className={styles.Sep}></div>
            <div className={styles.ProfileFollow} onClick={() => setIsOpenFollowModal('followers')}>
              <strong>{followers}</strong>
              <span>Follower{followers > 1 ? 's' : ''}</span>
            </div>
          </div>
              <div className={styles.ProfileButtons}>
                {
                  connected.account && props.address !== connected.account ?
                    isFollowing ?
                    <button onClick={unfollowUser} className={'btn btn-secondary-no-fill'}>Following</button>
                    :
                    <button onClick={followUser} className={'btn btn-secondary'}>Follow</button>
                    :
                    <></>
                }
                <div className={styles.ProfileExtraActions}>
                  <button onClick={() => setIsOpenExtraAction(!isOpenExtraAction)} className={'btn btn-secondary-no-fill'}>...</button>
                  {
                    isOpenExtraAction && (
                        <div className={styles.ExtraActionsPopup}>
                          <span onClick={() => shareOnTwitter()}><img src={shareIcon.src} alt="Share profile"/>Share</span>
                          <span onClick={() => reportUser()}><img src={reportIcon.src} alt="Report user"/>Report</span>
                          <span onClick={() => blockUser()}><img src={blockIcon.src} alt="Block user"/>Block</span>
                        </div>
                      )
                  }
                </div>
              </div>
          {
            (props.profileInfo && (props.profileInfo.links && props.profileInfo.links?.length > 0 || props.profileInfo.description || props.profileInfo.tags?.length > 0)) &&
              <MoreInfo tags={props.profileInfo.tags} bio={props.profileInfo.description} links={props.profileInfo.links}/>
          }
          <div className={styles.Activity}>
            <Activity loading={feedLoading} headline='Activity' feed={feed.filter(p => !p.hided)} loadNext={(filter) => loadMorePosts(filter)} onFilterChange={(filter) => fetchPosts(filter)}></Activity>
          </div>
        </div>
        <div className={styles.ProfilePageFooter}>
          <Footer/>
        </div>
      </div>
    </>
  );
}

export default Profile;
