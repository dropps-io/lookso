import React, {ForwardedRef, forwardRef, useEffect, useState} from 'react';
import styles from './PostBox.module.scss';
import Link from "next/link";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL, WEBSITE_URL} from "../../environment/endpoints";
import {dateDifference} from "../../core/utils/date-difference";
import externalLinkIcon from "../../assets/icons/external-link.svg";
import executedEventIcon from "../../assets/icons/events/executed.png";
import commentIcon from "../../assets/icons/comment.svg";
import repostIcon from "../../assets/icons/repost.svg";
import heartFullIcon from "../../assets/icons/heart-full.svg";
import heartIcon from "../../assets/icons/heart.svg";
import shareIcon from "../../assets/icons/share.svg";
import {connectToAPI, connectWeb3} from "../../core/web3";
import {setProfileInfo, setProfileJwt} from "../../store/profile-reducer";
import {insertLike, requestNewRegistryJsonUrl, setNewRegistryPostedOnProfile} from "../../core/api";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import PostContent from "./construct-post-content";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../UserTag/UserTag";
import {useRouter} from "next/router";
import CommentModal from "../Modals/CommentModal/CommentModal";
import RepostModal from "../Modals/RepostModal/RepostModal";
import FourOhFour from "../../pages/404";
import LoadingModal from "../Modals/LoadingModal/LoadingModal";
import {updateRegistry} from "../../core/update-registry";
import ActionModal from "../Modals/ActionModal/ActionModal";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";

export interface FeedPost {
  hash: string,
  author:
    {
      address: string,
      name: string,
      image: string
    },
  type: 'event' | 'post',
  name: string,
  date: Date,
  blockNumber: number,
  transactionHash: string,
  display: FeedDisplay,
  likes: number,
  comments: number,
  reposts: number,
  isLiked: boolean,
  inRegistry?: boolean,
  childPost?: FeedPost,
  trusted?: boolean
}

export const initialFeedPost: FeedPost = {
  hash: '',
  author:
    {
      address: '',
      name: '',
      image: DEFAULT_PROFILE_IMAGE
    },
  type: 'post',
  name: '',
  date: new Date(),
  blockNumber: 0,
  transactionHash: '',
  display: {text: '', params: {}, image: '', tags: {standard: null, standardType: null, copies: null}},
  likes: 0,
  comments: 0,
  reposts: 0,
  isLiked: false
}

export interface FeedDisplay {
  text: string,
  params: {[key: string]: FeedDisplayParam},
  image: string,
  tags: {standard: string | null, copies: string | null, standardType: string | null}
}

export interface FeedDisplayParam {
  value: string,
  display: string,
  type: string,
  additionalProperties: any;
}

export const INITIAL_FEED_DISPLAY: FeedDisplay = {
  text: '',
  params: {},
  image: '',
  tags: {standard: null, copies: null, standardType: null}
}

interface PostProps {
  post: FeedPost;
  isLiked?: boolean;
  newComment?: ((comment: FeedPost) => any);
  newRepost?: ((repost: FeedPost) => any);
  comment?: boolean;
  repost?: boolean;
  static?: boolean;
}
// eslint-disable-next-line react/display-name
const PostBox = forwardRef((props: PostProps, ref: ForwardedRef<HTMLDivElement>): React.ReactElement => {
  const router = useRouter();
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showUpInstallationModal, setShowUpInstallationModal] = useState(false);

  let clickLoading = false;


  useEffect(() => {
    setLikes(props.post.likes);
    setIsLiked(props.post.isLiked);

    if (props.isLiked) setIsLiked(props.isLiked)
  }, [props.post, props.isLiked]);

  async function requestJWT() {
    const resJWT = await connectToAPI(account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  function goTo(path: string) {
    router.push(path);
  }

  async function likeOrUnlikePost() {
    if (props.static) return;
    if (!account) setShowLogInModal(true);

    const newLikes = !isLiked ? 1 : - 1;
    setLikes(existing => existing + newLikes);
    setIsLiked(newLikes > 0);

    try {
      let headersJWT = jwt;

      if (!headersJWT) {
        headersJWT = await requestJWT();
      }

      try {
        const res: any = await insertLike(account, props.post.hash, headersJWT);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(headersJWT, res.jsonUrl);
      } catch (e: any) {
        console.error(e);
        setLikes(existing => existing - newLikes);
        setIsLiked(newLikes < 0);
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain(headersJWT)
        }
      }
    }
    catch (e: any) {
      console.error(e);
      setLikes(existing => existing - newLikes);
      setIsLiked(newLikes < 0);
    }
  }

  async function pushRegistryToTheBlockchain(_jwt: string, jsonUrl?: string) {
    setLoadingMessage('It\'s time to push everything to the blockchain! ⛓️')

    try {
      const JSONURL = jsonUrl ? jsonUrl : (await requestNewRegistryJsonUrl(account, _jwt)).jsonUrl
      await updateRegistry(account, JSONURL, web3);
      await setNewRegistryPostedOnProfile(account, _jwt);
      setLoadingMessage('');
    } catch (e) {
      setLoadingMessage('');
    }
  }

  function closeCommentModal(newComment?: FeedPost) {
    if (props.static  || !account) return;
    setShowCommentModal(false);
    if (newComment && props.newComment) props.newComment(newComment);
  }

  function closeRepostModal(newPost?: FeedPost) {
    if (props.static  || !account) return;
    setShowRepostModal(false);
    if (newPost && props.newRepost) props.newRepost(newPost);
  }

  function goToPost() {
    router.push('/Post/' +props.post.hash);
  }

  function shareOnTwitter() {
    const content: string = `Checkout ${account === props.post.author.address ? 'my' : 'this'} post on @lookso_io! \n\n${WEBSITE_URL}/Post/${props.post.hash}`
    window.open(  'https://twitter.com/intent/tweet?text=' + content, '_blank');
  }
  
  function openCommentModal() {
    if (!account) setShowLogInModal(true);
    else setShowCommentModal(true);
  }

  function openRepostModal() {
    if (!account) setShowLogInModal(true);
    else setShowRepostModal(true);
  }

  function goToUpInstallationGuide() {
    window.open('https://docs.lukso.tech/guides/browser-extension/install-browser-extension/', '_blank');
    setShowUpInstallationModal(false);
  }

  async function connectToWeb3() {
    let web3Info;
    try {
      web3Info = await connectWeb3();
    } catch (e: any) {
      console.error(e.message);
      if ((e.message as string).includes('Provider')) {
        setShowUpInstallationModal(true);
        setShowLogInModal(false)
      }
      return;
    }

    if (web3Info) {
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
      dispatch(setProfileInfo(web3Info.profileInfo));
    }
  }

  function goToAddress(address: string) {
    window.open( EXPLORER_URL + '/address/' + address, '_blank');
  }

  function goToProfile(address: string) {
    router.push('/Profile/' + address);
  }

  function copy(value: string) {
    navigator.clipboard.writeText(value);
  }

  async function handleClick(e: any, value?: string) {
    if (clickLoading) return;
    clickLoading = true;
    
    const el: HTMLElement = e.target as HTMLElement;

    if (value) {
      if(el.className.includes('EventImage')) goToPost();
      if(el.className.includes('PostImage')) goToPost();
      else if(el.className.includes('UserTag')) goToProfile(value);
      else if(el.className.includes('AssetTag') || el.id === 'name') goToAddress(value);
      else if(el.className.includes('Address')) goToAddress(value)
      else if(el.className.includes('Bytes32')) copy(value);
      else goToPost()
    } else {
      goToPost();
    }

    setTimeout(() => {
      clickLoading = false;
    }, 10);
  }

  //TODO in UserTag component add max length name prop number

  if (props.post) return (
    <>
      <ActionModal open={showUpInstallationModal} onClose={() => setShowUpInstallationModal(false)} textToDisplay={'Universal Profile not detected'} btnText={'Go to docs.lukso.tech'} callback={goToUpInstallationGuide}/>
      <ActionModal open={showLogInModal} onClose={() => setShowLogInModal(false)} textToDisplay={'Please log in first'} btnText={'Log in'} callback={() => connectToWeb3()}/>
      <LoadingModal open={!!loadingMessage} onClose={() => {}} textToDisplay={loadingMessage}/>
      <CommentModal open={showCommentModal} onClose={closeCommentModal} post={props.post} />
      <RepostModal open={showRepostModal} onClose={closeRepostModal} post={props.post}/>
      <div ref={ref} className={`${styles.FeedPost} ${props.post.type === 'post' ? styles.PostType : styles.EventType} ${props.comment || props.repost  ? styles.Comment : ''} ${props.repost ? styles.Repost : ''}`}>
        <div className={styles.PostHeader}>
          <div className={styles.LeftPart}>
            <Link href={`/Profile/${props.post.author.address}`}>
              <div className={styles.ProfileImageMedium} style={{backgroundImage: props.post.author.image ? `url(${formatUrl(props.post.author.image)})` : `url(${DEFAULT_PROFILE_IMAGE})`}}></div>
            </Link>
            <div className={styles.UserTag}>
              <UserTag username={props.post.author.name} address={props.post.author.address} onClick={() => goTo(`/Profile/${props.post.author.address}`)}/>
            </div>
          </div>
          <div className={styles.RightPart}>
            <span>{dateDifference(new Date(Date.now()), new Date(props.post.date))} ago</span>
            <a title={'Explorer'} href={EXPLORER_URL + 'tx/' + props.post.transactionHash} target='_blank' rel="noopener noreferrer">
              <img src={externalLinkIcon.src} alt=""/>
            </a>
          </div>
        </div>
        <div className={styles.PostTags}>
          {props.post.display.tags.standard ?
            <div className={styles.PostTag}>{props.post.display.tags.standard}</div>
           : <></>}
          {props.post.display.tags.standardType ?
            <div className={styles.PostTag}>{props.post.display.tags.standardType}</div>
            : <></>}
        </div>
        <div onClick={handleClick} className={styles.PostContent}>
          {
            props.post.type === 'event' ?
              props.post.display.image ?
                <div style={{backgroundImage: `url(${formatUrl(props.post.display.image)})`}} className={styles.EventImage} />
                :
                <img className={styles.EventIcon} src={executedEventIcon.src} alt="Executed Event"/>
              :
              <></>
          }
          {props.post.display.text ? <PostContent onClick={handleClick} text={props.post.display.text} params={props.post.display.params}/> : <p>Event: {props.post.name}</p>}
          {
            props.post.type === 'post' && props.post.display.image ?
              <img src={formatUrl(props.post.display.image)} className={styles.PostImage} alt='' />
            :
              <></>
          }
          {
            props.post.childPost ?
              <PostBox post={props.post.childPost} static repost/> : <></>
          }
        </div>
        {props.static ?
          <></> :
          <div className={styles.PostFooter}>
            <div></div>
            <div className={styles.PostActions}>
              <div title={'Comment'} className={styles.IconNumber} onClick={openCommentModal}>
                <img src={commentIcon.src} alt=""/>
                <span>{props.post.comments}</span>
              </div>
              <div title={'Repost'} className={styles.IconNumber}  onClick={openRepostModal}>
                <img src={repostIcon.src} alt=""/>
                <span>{props.post.reposts}</span>
              </div>
              <div title={'Like'} onClick={() => likeOrUnlikePost()} className={styles.IconNumber}>
                {isLiked ? <img src={heartFullIcon.src} alt=""/> : <img src={heartIcon.src} alt=""/>}
                <span>{likes}</span>
              </div>
            </div>
            <img title={'Share'} onClick={shareOnTwitter} className={styles.PostShare} src={shareIcon.src} alt=""/>
          </div>
        }
      </div>
    </>
  );
  else return <FourOhFour/>
});

export default PostBox;
