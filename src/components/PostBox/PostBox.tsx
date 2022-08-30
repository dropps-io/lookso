import React, {ForwardedRef, forwardRef, useEffect, useState} from 'react';
import styles from './PostBox.module.scss';
import Link from "next/link";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL, IPFS_GATEWAY, POST_VALIDATOR_ADDRESS, WEBSITE_URL} from "../../environment/endpoints";
import {dateDifference} from "../../core/utils/date-difference";
import executedEventIcon from "../../assets/icons/events/executed.png";
import receivedEventIcon from "../../assets/icons/events/received.png";
import commentIcon from "../../assets/icons/comment.svg";
import repostIcon from "../../assets/icons/repost.svg";
import repostComment from '../../assets/icons/repost_comment.svg'
import heartFullIcon from "../../assets/icons/heart-full.svg";
import heartIcon from "../../assets/icons/heart.svg";
import shareIcon from "../../assets/icons/share.svg";
import {connectToAPI, connectWeb3, signMessage} from "../../core/web3";
import {setProfileInfo, setProfileJwt} from "../../store/profile-reducer";
import {
  insertFollow,
  insertLike,
  insertUnfollow,
  requestNewRegistryJsonUrl,
  setNewRegistryPostedOnProfile, uploadPostObject
} from "../../core/api";
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
import {updateRegistry, updateRegistryWithPost} from "../../core/update-registry";
import ActionModal from "../Modals/ActionModal/ActionModal";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";
import ExtendImage from "../ExtendImage/ExtendImage";
import PopupButton from "../PopupButton/PopupButton";
import {UniversalProfile} from "../../core/UniversalProfile/UniversalProfile.class";
import {LSPXXProfilePost} from "../../models/profile-post";

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
  parentPost?: FeedPost,
  trusted?: boolean,
  hided?: boolean
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
  onUnfollow?: ((address: string) => any);
  comment?: boolean;
  repost?: boolean;
  static?: boolean;
  noPadding?: boolean;
}


// eslint-disable-next-line react/display-name
const PostBox = forwardRef((props: PostProps, ref: ForwardedRef<HTMLDivElement>): React.ReactElement => {

  const router = useRouter();
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const profileImage = useSelector((state: RootState) => state.profile.profileImage);
  const username = useSelector((state: RootState) => state.profile.name);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showUpInstallationModal, setShowUpInstallationModal] = useState(false);
  // extra button with "Explore" | "Hide"
  const [isOpenExtraAction, setIsOpenExtraAction] = useState(false);

  const [isOpenRepostAction, setIsOpenRepostAction] = useState(false);

  let clickLoading = false;

  const [isExtendPostImage, setIsExtendPostImage] = useState(false);

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

  function openCommentModal(hash: string) {
    router.push('/Post/' + hash);
  }

  function openRepostModal() {
    if (!account) setShowLogInModal(true);
    else setShowRepostModal(true);
  }

  function goTo(url : string) {
    window.open(url, '_blank');
    setShowUpInstallationModal(false);
    setIsOpenExtraAction(false);
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

    // stop process if user is highlighting something
    if (window.getSelection()?.toString()) return

    // stop process if user click on an image or backdrop of Extend Image
    if(e?.target?.className?.includes('ExtendImage')) {
      e.preventDefault()
      return
    }

    if (clickLoading) return;
    clickLoading = true;

    const el: HTMLElement = e.target as HTMLElement;

    if (value) {
      if(el.className.includes('UserTag')) goToProfile(value);
      else if(el.className.includes('AssetTag') || el.id === 'name') goToAddress(value);
      else if(el.className.includes('Address')) goToAddress(value)
      else if(el.className.includes('Bytes32')) copy(value);
      else goToPost()
    } else if (!el.className.includes('Link') && !el.className.includes('PostImage') && !el.className.includes('EventImage')) {
      goToPost();
    }

    setTimeout(() => {
      clickLoading = false;
    }, 10);
  }

  /**
   * When user click on "Unfollow"
   * @param address
   */
  async function unfollowUser(address: string) {
    setIsOpenExtraAction(false);
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      try {
        const res: any  = await insertUnfollow(account, address, headersJWT);
        if (props.onUnfollow) props.onUnfollow(address);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(headersJWT, res.jsonUrl);
      } catch (e: any) {
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain(headersJWT)
        }
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  async function followUser(address: string) {
    setIsOpenExtraAction(false);
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      try {
        const res: any  = await insertFollow(account, address, headersJWT);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(headersJWT, res.jsonUrl);
      } catch (e: any) {
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain(headersJWT)
        }
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  async function onClickProfile() {
    // stop process if user is highlighting something
    if (window.getSelection()?.toString()) return
    // redirect to pro
    goToProfile(props?.post?.author?.address)
  }

  async function createPost(childHash?: string) {
    try {
      setLoadingMessage(' ');
      const author: UniversalProfile = new UniversalProfile(account, IPFS_GATEWAY, web3);
      const permissions = await author.fetchPermissionsOf(POST_VALIDATOR_ADDRESS);


      if (!permissions) {
        setLoadingMessage('Your first post will require you to grant LOOKSO permission to save posts on your Universal Profile');
        await author.setPermissionsTo(POST_VALIDATOR_ADDRESS, {SETDATA: true});
      }

      let post: LSPXXProfilePost = {
        version: '0.0.1',
        message: '',
        author: account,
        validator: POST_VALIDATOR_ADDRESS,
        nonce: Math.floor(Math.random() * 1000000000).toString(),
        links: [],
        childHash: childHash,
      };

      const resJWT = jwt ? jwt : await requestJWT();

      setLoadingMessage('Please sign your post');
      const signedMessage = await signMessage(account, JSON.stringify(post), web3);
      setLoadingMessage('Thanks, we\'re uploading your post 😎');
      const postUploaded = await uploadPostObject(post, signedMessage, resJWT);

      setLoadingMessage('Last step: sending your post to the blockchain! ⛓️');
      const receipt = await updateRegistryWithPost(account, postUploaded.postHash, postUploaded.jsonUrl, web3);
      await setNewRegistryPostedOnProfile(account, resJWT);

      if (props.newRepost) {
        props.newRepost({
          date: new Date(),
          author: {
            address: account,
            name: username,
            image: profileImage
          },
          name: '',
          type: 'post',
          display: {
            text: '',
            params: {},
            image: '',
            tags: {standard: null, standardType: null, copies: null}
          },
          hash: postUploaded.postHash,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          comments: 0,
          likes: 0,
          isLiked: false,
          reposts: 0,
          childPost: childHash ? props.post : undefined
        });
      }

      setLoadingMessage('');

    } catch (e) {
      setLoadingMessage('');
    }
  }


  //TODO in UserTag component add max length name prop number

  if (props.post) return (
    <>
      <ActionModal open={showUpInstallationModal} onClose={() => setShowUpInstallationModal(false)} textToDisplay={'Universal Profile not detected'} btnText={'Go to docs.lukso.tech'} callback={() => goTo('https://docs.lukso.tech/guides/browser-extension/install-browser-extension/')}/>
      <ActionModal open={showLogInModal} onClose={() => setShowLogInModal(false)} textToDisplay={'Please log in first'} btnText={'Log in'} callback={() => connectToWeb3()}/>
      <LoadingModal open={!!loadingMessage} onClose={() => {}} textToDisplay={loadingMessage}/>
      <CommentModal open={showCommentModal} onClose={closeCommentModal} post={props.post} />
      <RepostModal open={showRepostModal} onClose={closeRepostModal} post={props.post}/>
      <div ref={ref} className={`${styles.FeedPost} ${props.noPadding ? styles.NoPadding : ''} ${props.post.type === 'post' ? styles.PostType : styles.EventType} ${(props.comment) ? styles.Comment : ''} ${props.repost ? styles.Repost : ''}`}>
        {props.post.parentPost &&
          <div className={styles.ParentPost}>
            <div className={styles.Post}>
              <PostBox key={'parent-post'} post={props.post.parentPost} comment noPadding/>
            </div>
          </div>
        }
        {(isOpenExtraAction || isOpenRepostAction) && <div className={'backdrop'} onClick={() => {
          setIsOpenExtraAction(false);
          setIsOpenRepostAction(false);
        }}></div>}
        <div className={styles.PostHeader}>
          <div className={styles.LeftPart}>
            <Link href={`/Profile/${props.post.author.address}`}>
              <div className={styles.ProfileImageMedium} style={{backgroundImage: props.post.author.image ? `url(${formatUrl(props.post.author.image)})` : `url(${DEFAULT_PROFILE_IMAGE})`}}></div>
            </Link>
            <div className={styles.UserTag}>
              <UserTag username={props.post.author.name} address={props.post.author.address} onClick={onClickProfile}/>
            </div>
          </div>
          <div className={styles.RightPart}>
            <span>{dateDifference(new Date(Date.now()), new Date(props.post.date))} ago</span>
            {
              props.post.author.address === account ?
                  <div className={styles.RightPartButton}>
                    <span onClick={() => setIsOpenExtraAction(!isOpenExtraAction)}>...</span>
                    {
                        isOpenExtraAction && (
                        <PopupButton className={styles.MoreActionPopup} callback={() => setIsOpenExtraAction(false)}>
                              <a onClick={() => goTo(EXPLORER_URL + 'tx/' + props.post.transactionHash)}>Explorer</a>
                              <span>Hide</span>
                        </PopupButton>
                        )
                    }
                  </div>
                  :
                  <div className={styles.RightPartButton}>
                    <span onClick={() => setIsOpenExtraAction(!isOpenExtraAction)}>...</span>
                    {
                        isOpenExtraAction && (
                            <PopupButton className={styles.MoreActionPopup} callback={() => setIsOpenExtraAction(false)}>
                              <a title={'Explorer'} onClick={() => goTo(EXPLORER_URL + 'tx/' + props.post.transactionHash)}>Explorer</a>
                              {
                                  router.asPath === '/feed' && <div onClick={() => unfollowUser(props.post.author.address)} className={styles.RightPartButtonUnfollow}>
                                    <span>Unfollow </span>
                                    <UserTag username={props.post.author.name} address={props.post.author.address}/>
                                  </div>
                              }
                              {
                                  router.asPath === '/explore' && <div onClick={() => followUser(props.post.author.address)} className={styles.RightPartButtonUnfollow}>
                                    <span>Follow </span>
                                    <UserTag username={props.post.author.name} address={props.post.author.address}/>
                                  </div>
                              }
                            </PopupButton>
                        )
                    }
                  </div>
            }

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
                  <>
                    <div style={{backgroundImage: `url(${formatUrl(props.post.display.image)})`}} className={styles.EventImage} onClick={() => setIsExtendPostImage(true)} />
                    {
                      isExtendPostImage && <ExtendImage open={isExtendPostImage} image={props.post.display?.image} alt={`Image of post by ${props.post.author}`} callback={() => setIsExtendPostImage(false)} rounded={false}/>
                    }
                  </>
                :
                props.post.name === 'ValueReceived' || props.post.name === 'UniversalReceiver' ?
                  <img className={styles.EventIcon} src={receivedEventIcon.src} onClick={handleClick} alt="Received Event"/>
                  :
                  <img className={styles.EventIcon} src={executedEventIcon.src} onClick={handleClick} alt="Executed Event"/>
              :
              <></>
          }
          {props.post.display.text ? <PostContent onClick={handleClick} text={props.post.display.text} params={props.post.display.params}/> : props.post.type === 'event' && <p>Event: {props.post.name}</p>}
          {
            props.post.type === 'post' && props.post.display.image ?

                <>
                  <img src={formatUrl(props.post.display.image)} className={styles.PostImage} alt={`Image of post by ${props.post.author}`} onClick={() => setIsExtendPostImage(true)} />
                  {
                      isExtendPostImage && <ExtendImage open={isExtendPostImage} image={props.post.display?.image} alt={`Image of post by ${props.post.author}`} callback={() => setIsExtendPostImage(false)} rounded={false}/>
                  }
                </>
            :
              <></>
          }
        </div>
        {
          props.post.childPost ?
            <PostBox post={props.post.childPost} static repost/> : <></>
        }
        {props.static ?
          <></> :
          <div className={styles.PostFooter}>
            <div></div>
            <div className={styles.PostActions}>
              <div title={'Comment'} className={styles.IconNumber} onClick={() => openCommentModal(props.post.hash)}>
                <img src={commentIcon.src} alt=""/>
                <span>{props.post.comments}</span>
              </div>
              <div title={'Repost'} className={styles.IconNumber}  onClick={() => setIsOpenRepostAction(!isOpenRepostAction)}>
                <img src={repostIcon.src} alt=""/>
                <span>{props.post.reposts}</span>
                {
                    isOpenRepostAction && (
                        <PopupButton className={styles.RepostPopup} callback={() => setIsOpenRepostAction(false)}>
                          <div onClick={() => createPost(props.post.hash)} className={styles.PopupButtonItem}>
                            <img src={repostIcon.src} alt="Repost"/>
                            <span>Repost </span>
                          </div>
                          <div onClick={() => openRepostModal()} className={styles.PopupButtonItem}>
                            <img src={repostComment.src} alt="Repost"/>
                            <span>Repost with comment </span>
                          </div>
                        </PopupButton>
                    )
                }
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
