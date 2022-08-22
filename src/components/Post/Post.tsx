import React, {ForwardedRef, forwardRef, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import Link from "next/link";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL} from "../../environment/endpoints";
import {dateDifference} from "../../core/utils/date-difference";
import externalLinkIcon from "../../assets/icons/external-link.svg";
import executedEventIcon from "../../assets/icons/events/executed.png";
import commentIcon from "../../assets/icons/comment.svg";
import repostIcon from "../../assets/icons/repost.svg";
import heartFullIcon from "../../assets/icons/heart-full.svg";
import heartIcon from "../../assets/icons/heart.svg";
import shareIcon from "../../assets/icons/share.svg";
import {connectToAPI} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import {insertLike} from "../../core/api";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import PostContent from "./construct-post-content";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../UserTag/UserTag";
import {useRouter} from "next/router";
import CommentModal from "../Modals/CommentModal/CommentModal";

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
  inRegistry?: boolean
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
  static?: boolean;
}
// eslint-disable-next-line react/display-name
const Post = forwardRef((props: PostProps, ref: ForwardedRef<HTMLDivElement>): React.ReactElement => {
  const router = useRouter();
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

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
    if (props.static || !account) return;

    const newLikes = !isLiked ? 1 : - 1;
    setLikes(existing => existing + newLikes);
    setIsLiked(newLikes > 0);

    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }

      await insertLike(account, props.post.hash, headersJWT);
    }

    catch (e) {
      setLikes(existing => existing - newLikes);
      setIsLiked(newLikes < 0);
    }
  }

  function toggleCommentPopUp() {
    if (props.static  || !account) return;
    setShowCommentModal(!showCommentModal);
  }

  useEffect(() => {
    setLikes(props.post.likes);
    setIsLiked(props.post.isLiked);
  }, [props.post]);

  //TODO in UserTag component add max length name prop number

  return (
    <>
      <CommentModal open={showCommentModal} onClose={toggleCommentPopUp} post={props.post} />
      <div ref={ref} className={`${styles.FeedPost} ${props.post.type === 'post' ? styles.PostType : styles.EventType}`}>
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
            <span>{dateDifference(new Date(Date.now()), new Date(props.post.date))} Ago</span>
            <a href={EXPLORER_URL + 'tx/' + props.post.transactionHash} target='_blank' rel="noopener noreferrer">
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
        <div className={styles.PostContent}>
          {
            props.post.type === 'event' ?
              props.post.display.image ?
                <div style={{backgroundImage: `url(${formatUrl(props.post.display.image)})`}} className={styles.EventImage} />
                :
                <img className={styles.EventIcon} src={executedEventIcon.src} alt="Executed Event"/>
              :
              <></>
          }
          {props.post.display.text ? <PostContent text={props.post.display.text} params={props.post.display.params}/> : <p>Event: {props.post.name}</p>}
          {
            props.post.type === 'post' && props.post.display.image ?
              <div style={{backgroundImage: `url(${formatUrl(props.post.display.image)})`}} className={styles.PostImage} />
            :
              <></>
          }
        </div>
        {props.static ?
          <></> :
          <div className={styles.PostFooter}>
            <div></div>
            <div className={styles.PostActions}>
              <div className={styles.IconNumber} onClick={toggleCommentPopUp}>
                <img src={commentIcon.src} alt=""/>
                <span>{props.post.comments}</span>
              </div>
              <div className={styles.IconNumber}>
                <img src={repostIcon.src} alt=""/>
                <span>{props.post.reposts}</span>
              </div>
              <div onClick={() => likeOrUnlikePost()} className={styles.IconNumber}>
                {isLiked ? <img src={heartFullIcon.src} alt=""/> : <img src={heartIcon.src} alt=""/>}
                <span>{likes}</span>
              </div>
            </div>
            <img className={styles.PostShare} src={shareIcon.src} alt=""/>
          </div>
        }
      </div>
    </>
  );
});

export default Post;
