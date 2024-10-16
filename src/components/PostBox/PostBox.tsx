import React, { type ForwardedRef, forwardRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import styles from './PostBox.module.scss';
import { formatUrl } from '../../core/utils/url-formating';
import { EXPLORER_URL, POST_VALIDATOR_ADDRESS, WEBSITE_URL } from '../../environment/endpoints';
import { dateDifference } from '../../core/utils/date-difference';
import executedEventIcon from '../../assets/icons/events/executed.png';
import receivedEventIcon from '../../assets/icons/events/received.png';
import dataChangedEventIcon from '../../assets/icons/events/data-changed.png';
import ownershipTransferredEventIcon from '../../assets/icons/events/transfer-ownership.png';
import commentIcon from '../../assets/icons/comment.svg';
import repostIcon from '../../assets/icons/repost.svg';
import repostComment from '../../assets/icons/repost_comment.svg';
import heartFullIcon from '../../assets/icons/heart-full.svg';
import heartIcon from '../../assets/icons/heart.svg';
import shareIcon from '../../assets/icons/share.svg';
import warningIcon from '../../assets/icons/warning.png';
import { connectWeb3 } from '../../core/web3';
import { setProfileInfo } from '../../store/profile-reducer';
import {
  insertFollow,
  insertLike,
  insertUnfollow,
  requestNewRegistryJsonUrl,
  setNewRegistryPostedOnProfile,
  uploadPostObject,
} from '../../core/api/api';
import { getFeedActions, type RootState } from '../../store/store';
import PostContent from './construct-post-content';
import { DEFAULT_PROFILE_IMAGE } from '../../core/utils/constants';
import UserTag from '../UserTag/UserTag';
import CommentModal from '../Modals/CommentModal/CommentModal';
import RepostModal from '../Modals/RepostModal/RepostModal';
import FourOhFour from '../../pages/404';
import LoadingModal from '../Modals/LoadingModal/LoadingModal';
import { updateRegistry, updateRegistryWithPost } from '../../core/update-registry';
import ActionModal from '../Modals/ActionModal/ActionModal';
import { setAccount, setBalance, setNetworkId, setWeb3 } from '../../store/web3-reducer';
import ExtendImage from '../ExtendImage/ExtendImage';
import PopupButton from '../PopupButton/PopupButton';
import { UniversalProfile } from '../../core/UniversalProfile/UniversalProfile.class';
import { type LSP19ProfilePost } from '../../models/profile-post';
import { IPFS_GATEWAY } from '../../environment/constants';

export interface FeedPost {
  hash: string;
  author: {
    address: string;
    name: string;
    image: string;
  };
  type: 'event' | 'post';
  name: string;
  date: Date;
  blockNumber: number;
  transactionHash: string;
  display: FeedDisplay;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  inRegistry?: boolean;
  childPost?: FeedPost;
  parentPost?: FeedPost;
  trusted?: boolean;
  hided?: boolean; // TODO misspelled, verify in DB if same name
}

export const initialFeedPost: FeedPost = {
  hash: '',
  author: {
    address: '',
    name: '',
    image: DEFAULT_PROFILE_IMAGE,
  },
  type: 'post',
  name: '',
  date: new Date(),
  blockNumber: 0,
  transactionHash: '',
  display: {
    text: '',
    params: {},
    image: '',
    tags: { standard: null, standardType: null, copies: null },
  },
  likes: 0,
  comments: 0,
  reposts: 0,
  isLiked: false,
};

export interface FeedDisplay {
  text: string;
  params: Record<string, FeedDisplayParam>;
  image: string;
  tags: { standard: string | null; copies: string | null; standardType: string | null };
}

export interface FeedDisplayParam {
  value: string;
  display: string;
  type: string;
  additionalProperties: any;
}

export const INITIAL_FEED_DISPLAY: FeedDisplay = {
  text: '',
  params: {},
  image: '',
  tags: { standard: null, copies: null, standardType: null },
};

interface PostProps {
  post: FeedPost;
  type?: 'Profile' | 'Feed' | 'Explore';
  isLiked?: boolean;
  newComment?: (comment: FeedPost) => any;
  onUnfollow?: (address: string) => any;
  postHierarchy: 'main' | 'parent' | 'child';
  comment?: boolean;
  static?: boolean;
  noPadding?: boolean;
}

// eslint-disable-next-line react/display-name
const PostBox = forwardRef(
  (props: PostProps, ref: ForwardedRef<HTMLDivElement>): React.ReactElement => {
    const router = useRouter();
    const dispatch = useDispatch();

    const account: string | undefined = useSelector((state: RootState) => state.web3.account);
    const profileImage = useSelector((state: RootState) => state.profile.profileImage);
    const username = useSelector((state: RootState) => state.profile.name);
    const web3 = useSelector((state: RootState) => state.web3.web3);

    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showRepostModal, setShowRepostModal] = useState(false);
    const [showLogInModal, setShowLogInModal] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showUpInstallationModal, setShowUpInstallationModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    // extra button with "Explore" | "Hide"
    const [isOpenExtraAction, setIsOpenExtraAction] = useState(false);
    const [isOpenRepostAction, setIsOpenRepostAction] = useState(false);
    const [isExtendPostImage, setIsExtendPostImage] = useState(false);

    let clickLoading = false;

    useEffect(() => {
      setLikes(props.post.likes);
      setIsLiked(props.post.isLiked);

      if (props.isLiked) setIsLiked(props.isLiked);
    }, [props.post, props.isLiked]);

    async function likeOrUnlikePost() {
      if (props.static) return;
      if (!account) setShowLogInModal(true);

      const newLikes = !isLiked ? 1 : -1;
      setLikes(existing => existing + newLikes);
      setIsLiked(newLikes > 0);

      try {
        const res: any = await insertLike(account || '', props.post.hash, router.asPath, web3);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(res.jsonUrl);
      } catch (e: any) {
        console.error(e);
        setLikes(existing => existing - newLikes);
        setIsLiked(newLikes < 0);
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain();
        }
      }
    }

    async function pushRegistryToTheBlockchain(jsonUrl?: string) {
      setLoadingMessage("It's time to push everything to the blockchain! ⛓️");

      try {
        const JSONURL =
          jsonUrl || (await requestNewRegistryJsonUrl(account || '', router.asPath, web3)).jsonUrl;
        await updateRegistry(account || '', JSONURL, web3);
        await setNewRegistryPostedOnProfile(account || '', router.asPath, web3);
        setLoadingMessage('');
      } catch (e) {
        setLoadingMessage('');
      }
    }

    function closeCommentModal(newComment?: FeedPost) {
      if (props.static || !account) return;
      setShowCommentModal(false);
      if (newComment != null && props.newComment != null) props.newComment(newComment);
    }

    function closeRepostModal() {
      if (props.static || !account) return;
      setShowRepostModal(false);
    }

    function goToPost() {
      router.push('/Post/' + props.post.hash);
    }

    function shareOnTwitter() {
      const content: string = `Checkout ${
        account === props.post.author.address ? 'my' : 'this'
      } post on @lookso_io! \n\n${WEBSITE_URL}/Post/${props.post.hash}`;
      window.open('https://twitter.com/intent/tweet?text=' + content, '_blank');
    }

    function openRepostModal() {
      setIsOpenRepostAction(false);
      if (!account) setShowLogInModal(true);
      else setShowRepostModal(true);
    }

    function goTo(url: string) {
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
        dispatch(setAccount(''));
        if ((e.message as string).includes('Provider')) {
          // Error when no provider extension found (metamask, up browser extension...)
          setShowUpInstallationModal(true);
          setShowLogInModal(false);
        }
        return;
      }

      if (web3Info != null) {
        dispatch(setWeb3(web3Info.web3));
        dispatch(setAccount(web3Info.account));
        dispatch(setBalance(web3Info.balance));
        dispatch(setNetworkId(web3Info.networkId));
        dispatch(setProfileInfo(web3Info.profileInfo));
      }
    }

    function goToAddress(address: string) {
      window.open(EXPLORER_URL + '/address/' + address, '_blank');
    }

    function goToProfile(address: string) {
      router.push('/Profile/' + address);
    }

    function copy(value: string) {
      navigator.clipboard.writeText(value);
    }

    async function handleClick(e: any, value?: string) {
      const el: HTMLElement = e.target as HTMLElement;
      console.log(el.className);

      if (!el.className.includes(props.postHierarchy)) return;
      if (props.type) dispatch(getFeedActions(props.type).setCurrentPost(props.post.hash));

      // stop process if user is highlighting something
      if (window.getSelection()?.toString()) return;

      // stop process if user click on an image or backdrop of Extend Image
      if (e?.target?.className?.includes('ExtendImage')) {
        e.preventDefault();
        return;
      }

      if (clickLoading) return;
      clickLoading = true;

      if (value) {
        if (el.className.includes('UserTag')) goToProfile(value);
        else if (el.className.includes('AssetTag') || el.id === 'name') goToAddress(value);
        else if (el.className.includes('Address')) goToAddress(value);
        else if (el.className.includes('Bytes32')) copy(value);
        else goToPost();
      } else if (el.className.includes('MoreOptions')) setIsOpenExtraAction(!isOpenExtraAction);
      else if (el.className.includes('PostShare')) shareOnTwitter();
      else if (el.className.includes('RepostIcon')) setIsOpenRepostAction(!isOpenRepostAction);
      else if (el.className.includes('LikeIcon')) await likeOrUnlikePost();
      else if (
        !el.className.includes('Link') &&
        !el.className.includes('PostImage') &&
        !el.className.includes('EventImage') &&
        !el.className.includes('ProfileTagged') &&
        !el.className.includes('ProfileImageMedium') &&
        !el.className.includes('IconNumber') &&
        !el.className.includes('Explorer') &&
        !el.className.includes('RepostHandler') &&
        !el.className.includes('backdrop')
      ) {
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
        const res: any = await insertUnfollow(account || '', router.asPath, address, web3);
        if (props.onUnfollow != null) props.onUnfollow(address);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(res.jsonUrl);
      } catch (e: any) {
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain();
        }
      }
    }

    async function followUser(address: string) {
      setIsOpenExtraAction(false);

      try {
        const res: any = await insertFollow(account || '', router.asPath, address, web3);
        if (res.jsonUrl) await pushRegistryToTheBlockchain(res.jsonUrl);
      } catch (e: any) {
        if (e.message.includes('registry')) {
          await pushRegistryToTheBlockchain();
        }
      }
    }

    async function createPost(childHash?: string) {
      setIsOpenRepostAction(false);
      if (!account) {
        setShowLogInModal(true);
        return;
      }
      try {
        setLoadingMessage(' ');
        const author: UniversalProfile = new UniversalProfile(account || '', IPFS_GATEWAY, web3);
        const permissions = await author.fetchPermissionsOf(POST_VALIDATOR_ADDRESS);

        if (!permissions) {
          setLoadingMessage(
            'Your first post will require you to grant LOOKSO permission to save posts on your Universal Profile'
          );
          await author.setPermissionsTo(POST_VALIDATOR_ADDRESS, { SETDATA: true });
        }

        const post: LSP19ProfilePost = {
          version: '0.0.1',
          message: '',
          author: account || '',
          validator: POST_VALIDATOR_ADDRESS,
          nonce: Math.floor(Math.random() * 1000000000).toString(),
          links: [],
          childHash,
        };

        setLoadingMessage("We're uploading your post 😎");
        const postUploaded = await uploadPostObject(post, router.asPath, web3);

        setLoadingMessage('Last step: sending your post to the blockchain! ⛓️');
        const receipt = await updateRegistryWithPost(
          account || '',
          postUploaded.postHash,
          postUploaded.jsonUrl,
          web3
        );
        await setNewRegistryPostedOnProfile(account || '', router.asPath, web3);

        const newPost: FeedPost = {
          date: new Date(),
          author: {
            address: account || '',
            name: username,
            image: profileImage,
          },
          name: '',
          type: 'post',
          display: {
            text: '',
            params: {},
            image: '',
            tags: { standard: null, standardType: null, copies: null },
          },
          hash: postUploaded.postHash,
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          comments: 0,
          likes: 0,
          isLiked: false,
          reposts: 0,
          childPost: childHash ? props.post : undefined,
        };

        dispatch(getFeedActions('Explore').addToTopOfStoredFeed([newPost]));
        dispatch(getFeedActions('Feed').addToTopOfStoredFeed([newPost]));

        setLoadingMessage('');
      } catch (e) {
        setLoadingMessage('');
      }
    }

    // TODO in UserTag component add max length name prop number

    if (props.post)
      return (
        <>
          <ActionModal
            open={showUpInstallationModal}
            onClose={() => {
              setShowUpInstallationModal(false);
            }}
            textToDisplay={'Universal Profile not detected'}
            btnText={'Go to docs.lukso.tech'}
            callback={() => {
              goTo('https://docs.lukso.tech/guides/browser-extension/install-browser-extension/');
            }}
          />
          <ActionModal
            open={showLogInModal}
            onClose={() => {
              setShowLogInModal(false);
            }}
            textToDisplay={'Please log in first'}
            btnText={'Log in'}
            callback={async () => {
              await connectToWeb3();
            }}
          />
          <ActionModal
            open={showWarningModal}
            onClose={() => {
              setShowWarningModal(false);
            }}
            textToDisplay={
              'Warning! The validator contract used on this post is not known by our platform. Send us an email at hello@dropps.io so we can verify it.'
            }
            btnText={'ok'}
            callback={() => {
              setShowWarningModal(false);
            }}
          />
          <LoadingModal open={!!loadingMessage} onClose={() => {}} textToDisplay={loadingMessage} />
          <CommentModal open={showCommentModal} onClose={closeCommentModal} post={props.post} />
          <RepostModal open={showRepostModal} onClose={closeRepostModal} post={props.post} />
          <div
            onClick={handleClick}
            ref={ref}
            className={`${styles.FeedPost} 
           ${props.noPadding ? styles.NoPadding : ''} 
           ${props.post.type === 'post' ? styles.PostType : styles.EventType} 
           ${props.postHierarchy === 'parent' || props.comment ? styles.Comment : ''} 
           ${props.postHierarchy === 'child' ? styles.Child : ''}
           ${props.postHierarchy}`}
          >
            {props.post.parentPost != null && (
              <div className={styles.ParentPost}>
                <div className={styles.Post}>
                  <PostBox
                    key={'parent-post'}
                    post={props.post.parentPost}
                    postHierarchy={'parent'}
                    noPadding
                  />
                </div>
              </div>
            )}
            {(isOpenExtraAction || isOpenRepostAction) && (
              <div
                className={'backdrop'}
                onClick={() => {
                  setIsOpenExtraAction(false);
                  setIsOpenRepostAction(false);
                }}
              ></div>
            )}
            <div className={`${styles.PostHeader} ${props.postHierarchy}`}>
              <div className={`${styles.LeftPart} ${props.postHierarchy}`}>
                <Link href={`/Profile/${props.post.author.address}`}>
                  <div
                    className={`${styles.ProfileImageMedium} ${props.postHierarchy}`}
                    style={{
                      backgroundImage: props.post.author.image
                        ? `url(${formatUrl(props.post.author.image)})`
                        : `url(${DEFAULT_PROFILE_IMAGE})`,
                    }}
                  ></div>
                </Link>
                <div
                  className={`${styles.UserTag} ${props.postHierarchy}`}
                  onClick={async e => {
                    await handleClick(e, props.post.author.address);
                  }}
                >
                  <UserTag
                    username={props.post.author.name}
                    address={props.post.author.address}
                    postHierarchy={props.postHierarchy}
                  />
                </div>
              </div>
              <div className={`${styles.RightPart} ${props.postHierarchy}`}>
                <span>{dateDifference(new Date(Date.now()), new Date(props.post.date))} ago</span>
                {props.post.author.address === account ? (
                  <div className={`${styles.RightPartButton} ${props.postHierarchy}`}>
                    <span
                      className={`${styles.MoreOptions} ${props.postHierarchy}`}
                      onClick={handleClick}
                    >
                      ...
                    </span>
                    {isOpenExtraAction && (
                      <PopupButton
                        className={`${styles.MoreActionPopup} ${props.postHierarchy}`}
                        callback={() => {
                          setIsOpenExtraAction(false);
                        }}
                      >
                        <a
                          className={`${styles.Explorer} ${props.postHierarchy}`}
                          onClick={() => {
                            goTo(EXPLORER_URL + 'tx/' + props.post.transactionHash);
                          }}
                        >
                          Explorer
                        </a>
                        <span>Hide (soon)</span>
                      </PopupButton>
                    )}
                  </div>
                ) : (
                  <div className={`${styles.RightPartButton} ${props.postHierarchy}`}>
                    <span
                      className={`${styles.MoreOptions} ${props.postHierarchy}`}
                      onClick={handleClick}
                    >
                      ...
                    </span>
                    {isOpenExtraAction && (
                      <PopupButton
                        className={`${styles.MoreActionPopup} ${props.postHierarchy}`}
                        callback={() => {
                          setIsOpenExtraAction(false);
                        }}
                      >
                        <a
                          className={`${styles.Explorer} ${props.postHierarchy}`}
                          onClick={() => {
                            goTo(EXPLORER_URL + 'tx/' + props.post.transactionHash);
                          }}
                        >
                          Explorer
                        </a>
                        {router.asPath === '/feed' && (
                          <div
                            onClick={async () => {
                              await unfollowUser(props.post.author.address);
                            }}
                            className={`${styles.RightPartButtonUnfollow} ${props.postHierarchy}`}
                          >
                            <span>Unfollow </span>
                            <UserTag
                              username={props.post.author.name}
                              address={props.post.author.address}
                            />
                          </div>
                        )}
                        {router.asPath === '/explore' && (
                          <div
                            onClick={async () => {
                              await followUser(props.post.author.address);
                            }}
                            className={`${styles.RightPartButtonUnfollow} ${props.postHierarchy}`}
                          >
                            <span>
                              Follow{' '}
                              <UserTag
                                username={props.post.author.name}
                                address={props.post.author.address}
                              />
                            </span>
                          </div>
                        )}
                      </PopupButton>
                    )}
                  </div>
                )}
                {props.post.type === 'post' &&
                  props.post.trusted !== undefined &&
                  !props.post.trusted && (
                    <div
                      className={`${styles.Warning} ${props.postHierarchy}`}
                      onClick={() => {
                        setShowWarningModal(true);
                      }}
                    >
                      <img src={warningIcon.src} alt="" />
                    </div>
                  )}
              </div>
            </div>
            <div className={`${styles.PostTags} ${props.postHierarchy}`}>
              {props.post.display.tags.standard ? (
                <div className={`${styles.PostTag} ${props.postHierarchy}`}>
                  {props.post.display.tags.standard}
                </div>
              ) : (
                <></>
              )}
              {props.post.display.tags.standardType ? (
                <div className={`${styles.PostTag} ${props.postHierarchy}`}>
                  {props.post.display.tags.standardType}
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className={`${styles.PostContent} ${props.postHierarchy}`}>
              {props.post.type === 'event' ? (
                props.post.display.image ? (
                  <>
                    <div
                      style={{ backgroundImage: `url(${formatUrl(props.post.display.image)})` }}
                      className={`${styles.EventImage} ${props.postHierarchy}`}
                      onClick={() => {
                        setIsExtendPostImage(true);
                      }}
                    />
                    {isExtendPostImage && (
                      <ExtendImage
                        open={isExtendPostImage}
                        image={props.post.display?.image}
                        alt={`Image of post by ${props.post.author}`}
                        callback={() => {
                          setIsExtendPostImage(false);
                        }}
                        rounded={false}
                      />
                    )}
                  </>
                ) : props.post.name === 'ValueReceived' ||
                  props.post.name === 'UniversalReceiver' ? (
                  <img
                    className={`${styles.EventIcon} ${props.postHierarchy}`}
                    src={receivedEventIcon.src}
                    onClick={handleClick}
                    alt="Received Event"
                  />
                ) : props.post.name === 'OwnershipTransferred' ? (
                  <img
                    className={`${styles.EventIcon} ${props.postHierarchy}`}
                    src={ownershipTransferredEventIcon.src}
                    onClick={handleClick}
                    alt="Ownership transferred Event"
                  />
                ) : props.post.name === 'DataChanged' ? (
                  <img
                    className={`${styles.EventIcon} ${props.postHierarchy}`}
                    src={dataChangedEventIcon.src}
                    onClick={handleClick}
                    alt="Data changed Event"
                  />
                ) : (
                  <img
                    className={`${styles.EventIcon} ${props.postHierarchy}`}
                    src={executedEventIcon.src}
                    onClick={handleClick}
                    alt="Executed Event"
                  />
                )
              ) : (
                <></>
              )}
              {props.post.display.text ? (
                <PostContent
                  onClick={handleClick}
                  text={props.post.display.text}
                  params={props.post.display.params}
                  postHierarchy={props.postHierarchy}
                />
              ) : (
                props.post.type === 'event' && <p>Event: {props.post.name}</p>
              )}
              {props.post.type === 'post' && props.post.display.image ? (
                <>
                  <img
                    src={formatUrl(props.post.display.image)}
                    className={`${styles.PostImage} ${props.postHierarchy}`}
                    alt={`Image of post by ${props.post.author}`}
                    onClick={() => {
                      setIsExtendPostImage(true);
                    }}
                  />
                  {isExtendPostImage && (
                    <ExtendImage
                      open={isExtendPostImage}
                      image={props.post.display?.image}
                      alt={`Image of post by ${props.post.author}`}
                      callback={() => {
                        setIsExtendPostImage(false);
                      }}
                      rounded={false}
                    />
                  )}
                </>
              ) : (
                <></>
              )}
            </div>
            {props.post.childPost != null ? (
              <PostBox post={props.post.childPost} static postHierarchy={'child'} />
            ) : (
              <></>
            )}
            {props.static ? (
              <></>
            ) : (
              <div className={`${styles.PostFooter} ${props.postHierarchy}`}>
                <div></div>
                <div className={`${styles.PostActions} ${props.postHierarchy}`}>
                  <div
                    title={'Comment'}
                    className={`${styles.IconNumber} ${styles.CommentIcon} ${props.postHierarchy}`}
                    onClick={handleClick}
                  >
                    <img
                      className={`${styles.CommentIcon} ${props.postHierarchy}`}
                      src={commentIcon.src}
                      alt=""
                    />
                    <span className={`${styles.CommentIcon} ${props.postHierarchy}`}>
                      {props.post.comments}
                    </span>
                  </div>
                  <div
                    title={'Repost'}
                    className={`${styles.IconNumber} ${styles.RepostIcon} ${props.postHierarchy}`}
                    onClick={handleClick}
                  >
                    <img
                      className={`${styles.RepostIcon} ${props.postHierarchy}`}
                      src={repostIcon.src}
                      alt=""
                    />
                    <span className={`${styles.RepostIcon} ${props.postHierarchy}`}>
                      {props.post.reposts}
                    </span>
                    {isOpenRepostAction && (
                      <PopupButton
                        className={`${styles.RepostPopup} ${props.postHierarchy}`}
                        callback={() => {
                          setIsOpenRepostAction(false);
                        }}
                      >
                        <div
                          onClick={async () => {
                            await createPost(props.post.hash);
                          }}
                          className={styles.PopupButtonItem}
                        >
                          <img
                            className={`${styles.RepostHandler} ${props.postHierarchy}`}
                            src={repostIcon.src}
                            alt="Repost"
                          />
                          <span className={`${styles.RepostHandler} ${props.postHierarchy}`}>
                            Repost{' '}
                          </span>
                        </div>
                        <div
                          onClick={() => {
                            openRepostModal();
                          }}
                          className={styles.PopupButtonItem}
                        >
                          <img
                            className={`${styles.RepostHandler} ${props.postHierarchy}`}
                            src={repostComment.src}
                            alt="Repost"
                          />
                          <span className={`${styles.RepostHandler} ${props.postHierarchy}`}>
                            Repost with comment{' '}
                          </span>
                        </div>
                      </PopupButton>
                    )}
                  </div>
                  <div
                    title={'Like'}
                    onClick={handleClick}
                    className={`${styles.IconNumber} ${styles.LikeIcon} ${props.postHierarchy}`}
                  >
                    {isLiked ? (
                      <img
                        className={`${styles.LikeIcon} ${props.postHierarchy}`}
                        src={heartFullIcon.src}
                        alt=""
                      />
                    ) : (
                      <img
                        className={`${styles.LikeIcon} ${props.postHierarchy}`}
                        src={heartIcon.src}
                        alt=""
                      />
                    )}
                    <span className={`${styles.LikeIcon} ${props.postHierarchy}`}>{likes}</span>
                  </div>
                </div>
                <img
                  title={'Share'}
                  onClick={handleClick}
                  className={styles.PostShare}
                  src={shareIcon.src}
                  alt=""
                />
              </div>
            )}
          </div>
        </>
      );
    else return <FourOhFour />;
  }
);

export default PostBox;
