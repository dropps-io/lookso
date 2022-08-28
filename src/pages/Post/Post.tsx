import React, {FC, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import PostBox, {FeedPost} from "../../components/PostBox/PostBox";
import {fetchIsLikedPost, fetchPostComments} from "../../core/api";
import Navbar from "../../components/Navbar/Navbar";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import Comments from "../../components/Comments/Comments";
import {useRouter} from "next/router";
import {POSTS_PER_LOAD} from "../../environment/constants";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";
import Footer from "../../components/Footer/Footer";
import CircularProgress from "@mui/material/CircularProgress";
import PostInput from "../../components/PostInput/PostInput";

interface PostProps {
  hash: string,
  post: FeedPost
}

// Add loading of additional comments
const Post: FC<PostProps> = (props) => {
  const router = useRouter();
  const account = useSelector((state: RootState) => state.web3.account);
  const [comments, setComments] = useState<FeedPost[]>([]);
  const [isLiking, setIsLiking] = useState(false);
  const [fullyLoadedComments, setFullyLoadedComments] = useState(false);
  const [offset, setOffset] = useState(0);

  let loading = false;


  useEffect(() => {
    async function init() {
      if (account && !isLiking) {
        const isLiking = await fetchIsLikedPost(account, props.hash);
        if (isLiking) {
          setIsLiking(true);
        }
      }
      const comments = await fetchPostComments(props.hash, POSTS_PER_LOAD, offset, account);
      if (router.query.newComment) {
        const newComment: FeedPost = JSON.parse(router.query.newComment as string);
        if (!comments.map(c => c.hash).includes(newComment.hash)) comments.unshift(newComment);
      }
      if (comments.length < POSTS_PER_LOAD) setFullyLoadedComments(true);
      setOffset(comments.length);
      setComments(comments);
    }

    if(props.hash) init();
  }, [props.hash, account]);

  function newComment(comment: FeedPost) {
    setComments(existing => [comment].concat(existing));
  }

  async function loadMoreComments() {
    if (loading || fullyLoadedComments) return;
    const comments = await fetchPostComments(props.hash, POSTS_PER_LOAD, offset, account);
    if (comments.length < POSTS_PER_LOAD) setFullyLoadedComments(true);
    setOffset(offset + comments.length);
    setComments(existing =>  existing.concat(comments));
  }

  return (
    <div className={styles.PostPage} data-testid="Post">
      <SidebarButtons/>
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.PostPageContent}>
        <div className={`${styles.Content} ${props.post.type === 'post' ? styles.PostType : ''}`}>
          <PostBox newComment={newComment} post={props.post} isLiked={isLiking}/>
          <div className={styles.NewComment}>
            <PostInput onNewPost={() => {}} parentHash={props.hash}/>
          </div>
          <div className={styles.Separator}></div>
          <Comments feed={comments} loadNext={loadMoreComments}/>
          {(!fullyLoadedComments) && <div className={styles.NoComments}><CircularProgress size={60}/></div>}
          {(fullyLoadedComments && comments.length === 0) && <div className={styles.NoComments}>
            <p>No comments yet 🤷</p>
            </div>
          }
        </div>
      </div>
      <div className={styles.Footer}><Footer/></div>
    </div>
  );
}

export default Post;
