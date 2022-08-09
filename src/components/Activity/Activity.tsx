import React, {FC, useEffect, useState} from 'react';
import styles from './Activity.module.scss';
import {FeedPost} from "../../models/post";
import {formatUrl} from "../../core/utils/url-formating";
import {EXPLORER_URL, IPFS_GATEWAY} from "../../environment/endpoints";
import externalLinkIcon from "../../assets/icons/external-link.svg";
import executedEventIcon from "../../assets/icons/events/executed.png";
import commentIcon from "../../assets/icons/comment.svg";
import repostIcon from "../../assets/icons/repost.svg";
import heartIcon from "../../assets/icons/heart.svg";
import heartFullIcon from "../../assets/icons/heart-full.svg";
import shareIcon from "../../assets/icons/share.svg";
import {constructPostContent} from "./construct-post-content";
import {dateDifference} from "../../core/utils/date-difference";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {connectToAPI} from "../../core/web3";
import {setProfileJwt} from "../../store/profile-reducer";
import {deleteLike, insertFollow, insertLike} from "../../core/api";

interface ActivityProps {
  feed: FeedPost[]
}

const Activity: FC<ActivityProps> = (props) => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);

  useEffect(() => {
    setFeed(props.feed);
  }, []);

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

  async function likeOrUnlikePost(postHash: string, i: number) {
    setFeed((existing: FeedPost[]) =>
      existing.map((post, n) => {
        if (i === n) {
          const newPost = post;
          newPost.isLiked = !post.isLiked;
          newPost.likes = newPost.isLiked ? newPost.likes + 1 : newPost.likes - 1;
          return newPost;
        }
        return post;
      })
    );

    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }

      await insertLike(account, postHash, headersJWT);
    }

    catch (e) {
      console.error(e);
      setFeed((existing: FeedPost[]) => existing.map((post, n) => {
        if (i === n) {
          post.isLiked = !post.isLiked;
          post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
        }
      }));
    }
  }


  return (
    <div className={styles.Feed}>
      <div className={styles.FeedHeader}>
        <h5>Activity</h5>
      </div>
      <div className={styles.FeedPosts}>
        {
          props.feed.map((post, index) =>
            <div key={post.hash} className={styles.FeedPost}>
              <div className={styles.PostHeader}>
                <div className={styles.LeftPart}>
                  <Link href={`/Profile/${post.author.address}`}>
                    <div className={styles.ProfileImageMedium} style={{backgroundImage: `url(${formatUrl(post.author.image, IPFS_GATEWAY)})`}}></div>
                  </Link>
                  <Link href={`/Profile/${post.author.address}`}>
                    <div className={styles.UserTag}>@{post.author.name}<span>#{post.author.address.slice(2, 6)}</span></div>
                  </Link>
                </div>
                <div className={styles.RightPart}>
                  <span>{dateDifference(new Date(Date.now()), new Date(post.date))} Ago</span>
                  <a href={EXPLORER_URL + 'tx/' + post.transactionHash} target='_blank'>
                    <img src={externalLinkIcon.src} alt=""/>
                  </a>
                </div>
              </div>
              <div className={styles.PostTags}>
                {
                  post.display.tags.standard ?
                    <>
                      <div className={styles.PostTag}>{post.display.tags.standard}</div>
                      <div className={styles.PostTag}>{post.display.tags.standardType}</div>
                    </>
                    :
                    <></>
                }
                {/*TODO add copies tag*/}
                {/*<div className={styles.PostTag}>*/}
                {/*  <img src="" alt=""/>*/}
                {/*  <span>20</span>*/}
                {/*</div>*/}
              </div>
              <div className={styles.PostContent}>
                <img src={executedEventIcon.src} alt="Executed Event"/>
                {
                  post.display.text ?
                  constructPostContent(post.display.text, post.display.params)
                    :
                    <p>Event: {post.name}</p>
                }
              </div>
              <div className={styles.PostFooter}>
                <div></div>
                <div className={styles.PostActions}>
                  <div className={styles.IconNumber}>
                    <img src={commentIcon.src} alt=""/>
                    <span>{post.comments}</span>
                  </div>
                  <div className={styles.IconNumber}>
                    <img src={repostIcon.src} alt=""/>
                    <span>{post.reposts}</span>
                  </div>
                  <div onClick={() => likeOrUnlikePost(post.hash, index)} className={styles.IconNumber}>
                    {
                      post.isLiked ?
                        <img src={heartFullIcon.src} alt=""/> :
                        <img src={heartIcon.src} alt=""/>
                    }
                    <span>{post.likes}</span>
                  </div>
                </div>
                <img className={styles.PostShare} src={shareIcon.src} alt=""/>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default Activity;
