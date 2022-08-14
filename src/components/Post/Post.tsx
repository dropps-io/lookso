import React, {FC, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import Link from "next/link";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL, IPFS_GATEWAY} from "../../environment/endpoints";
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
import PostInput from "../PostInput/PostInput";
import PostContent from "./construct-post-content";

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
  isLiked: boolean
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
}

const Post: FC<PostProps> = (props) => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [hash, setHash] = useState('');
  const [authorAddress, setAuthorAddress] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorImage, setAuthorImage] = useState('');
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [date, setDate]: [Date, any] = useState(new Date());
  const [txHash, setTxHash] = useState('');
  const [display, setDisplay]: [FeedDisplay, any] = useState(INITIAL_FEED_DISPLAY);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [reposts, setReposts] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commenting, setCommenting] = useState(false);

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
    const newLikes = !isLiked ? 1 : - 1;
    setLikes(existing => existing + newLikes);
    setIsLiked(newLikes > 0);

    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }

      await insertLike(account, hash, headersJWT);
    }

    catch (e) {
      setLikes(existing => existing - newLikes);
      setIsLiked(newLikes < 0);
    }
  }

  function toggleCommentPopUp() {
    document.body.style.overflowY = commenting ? 'scroll' : 'hidden';
    setCommenting(!commenting);
  }

  useEffect(() => {
    setHash(props.post.hash);
    setAuthorAddress(props.post.author.address);
    setAuthorName(props.post.author.name);
    setAuthorImage(props.post.author.image);
    setType(props.post.type);
    setName(props.post.name);
    setDate(props.post.date);
    setTxHash(props.post.transactionHash);
    setDisplay(props.post.display);
    setLikes(props.post.likes);
    setComments(props.post.comments);
    setReposts(props.post.reposts);
    setIsLiked(props.post.isLiked);
  }, []);

  return (
    <>
      {
        commenting ?
          <>
            <div onClick={toggleCommentPopUp} style={{top: `${document.documentElement.scrollTop || document.body.scrollTop}px`}} className={styles.Popup}/>
            <div style={{top: `${document.documentElement.scrollTop || document.body.scrollTop}px`}} className={styles.Container}>
              <div className={`${styles.FeedPost}`}>
                <div className={styles.PostHeader}>
                  <div className={styles.LeftPart}>
                    <Link href={`/Profile/${authorAddress}`}>
                      <div className={styles.ProfileImageMedium} style={{backgroundImage: `url(${formatUrl(authorImage, IPFS_GATEWAY)})`}}></div>
                    </Link>
                    <Link href={`/Profile/${authorAddress}`}>
                      <div className={styles.UserTag}>@{authorName}<span>#{authorAddress.slice(2, 6)}</span></div>
                    </Link>
                  </div>
                  <div className={styles.RightPart}>
                    <span>{dateDifference(new Date(Date.now()), new Date(date))} Ago</span>
                    <a href={EXPLORER_URL + 'tx/' + txHash} target='_blank' title={'Explorer'} rel="noopener noreferrer">
                      <img src={externalLinkIcon.src} alt=""/>
                    </a>
                  </div>
                </div>
                <div className={styles.PostTags}>
                  {display.tags.standard ? <>
                    <div className={styles.PostTag}>{display.tags.standard}</div>
                    <div className={styles.PostTag}>{display.tags.standardType}</div>
                  </> : <></>}
                  {/*TODO add copies tag*/}
                  {/*<div className={styles.PostTag}>*/}
                  {/*  <img src="" alt=""/>*/}
                  {/*  <span>20</span>*/}
                  {/*</div>*/}
                </div>
                <div className={styles.PostContent}>
                  <img src={executedEventIcon.src} alt="Executed Event"/>
                  {display.text ? <PostContent text={display.text} params={display.params}/> : <p>Event: {name}</p>}
                </div>
                <div className={styles.PostFooter}>
                  <div></div>
                  <div className={styles.PostActions}>
                    <div className={styles.IconNumber} onClick={toggleCommentPopUp}>
                      <img src={commentIcon.src} alt=""/>
                      <span>{comments}</span>
                    </div>
                    <div className={styles.IconNumber}>
                      <img src={repostIcon.src} alt=""/>
                      <span>{reposts}</span>
                    </div>
                    <div onClick={() => likeOrUnlikePost()} className={styles.IconNumber}>
                      {isLiked ? <img src={heartFullIcon.src} alt=""/> : <img src={heartIcon.src} alt=""/>}
                      <span>{likes}</span>
                    </div>
                  </div>
                  <img className={styles.PostShare} src={shareIcon.src} alt=""/>
                </div>
                <div className={styles.Separator}></div>
                <PostInput parentHash={hash}/>
              </div>
            </div>
          </>
        :
        <></>
      }
      <div className={`${styles.FeedPost}`}>
        <div className={styles.PostHeader}>
          <div className={styles.LeftPart}>
            <Link href={`/Profile/${authorAddress}`}>
              <div className={styles.ProfileImageMedium} style={{backgroundImage: `url(${formatUrl(authorImage, IPFS_GATEWAY)})`}}></div>
            </Link>
            <Link href={`/Profile/${authorAddress}`}>
              <div className={styles.UserTag}>@{authorName}<span>#{authorAddress.slice(2, 6)}</span></div>
            </Link>
          </div>
          <div className={styles.RightPart}>
            <span>{dateDifference(new Date(Date.now()), new Date(date))} Ago</span>
            <a href={EXPLORER_URL + 'tx/' + txHash} target='_blank' rel="noopener noreferrer">
              <img src={externalLinkIcon.src} alt=""/>
            </a>
          </div>
        </div>
        <div className={styles.PostTags}>
          {display.tags.standard ? <>
            <div className={styles.PostTag}>{display.tags.standard}</div>
            <div className={styles.PostTag}>{display.tags.standardType}</div>
          </> : <></>}
          {/*TODO add copies tag*/}
          {/*<div className={styles.PostTag}>*/}
          {/*  <img src="" alt=""/>*/}
          {/*  <span>20</span>*/}
          {/*</div>*/}
        </div>
        <div className={styles.PostContent}>
          <img src={executedEventIcon.src} alt="Executed Event"/>
          {display.text ? <PostContent text={display.text} params={display.params}/> : <p>Event: {name}</p>}
        </div>
        <div className={styles.PostFooter}>
          <div></div>
          <div className={styles.PostActions}>
            <div className={styles.IconNumber} onClick={toggleCommentPopUp}>
              <img src={commentIcon.src} alt=""/>
              <span>{comments}</span>
            </div>
            <div className={styles.IconNumber}>
              <img src={repostIcon.src} alt=""/>
              <span>{reposts}</span>
            </div>
            <div onClick={() => likeOrUnlikePost()} className={styles.IconNumber}>
              {isLiked ? <img src={heartFullIcon.src} alt=""/> : <img src={heartIcon.src} alt=""/>}
              <span>{likes}</span>
            </div>
          </div>
          <img className={styles.PostShare} src={shareIcon.src} alt=""/>
        </div>
      </div>
    </>
);
}

export default Post;
