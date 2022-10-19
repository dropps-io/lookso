import React, {FC, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import PostBox, {FeedPost} from "../../components/PostBox/PostBox";
import {fetchIsLikedPost, fetchPostComments} from "../../core/api";
import Navbar from "../../components/Navbar/Navbar";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import Comments from "../../components/Comments/Comments";
import {useRouter} from "next/router";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";
import Footer from "../../components/Footer/Footer";
import CircularProgress from "@mui/material/CircularProgress";
import PostInput from "../../components/PostInput/PostInput";
import {timer} from "../../core/utils/timer";

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
  const [page, setPage] = useState<number | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  let loading = false;

  useEffect(() => {
    async function init() {
      setInitialized(true);
      setFullyLoadedComments(false);
      setIsLiking(false);
      setComments([]);

      const isLiking = await fetchIsLikedPost(account ? account : '', props.hash);
      if (isLiking) {
        setIsLiking(true);
      }

      const res = await fetchPostComments(props.hash, 0, account ? account : undefined);
      if (router.query.newComment) {
        const newComment: FeedPost = JSON.parse(router.query.newComment as string);
        if (!res.results.map(c => c.hash).includes(newComment.hash)) res.results.unshift(newComment);
      }
      if (res.results.length === res.count) setFullyLoadedComments(true);
      setComments(res.results);
      setPage(res.page - 1);
      await timer(1000);
      setInitialized(false);
    }

    if (props.hash && !initialized && typeof account === 'string') init();
  }, [account]);

  function newComment(comment: FeedPost) {
    setComments(existing => [comment].concat(existing));
  }

  async function loadMoreComments() {
    if (loading || fullyLoadedComments) return;
    const res = await fetchPostComments(props.hash, page, account ? account : undefined);
    if (res.results.length === comments.length) setFullyLoadedComments(true);
    if (page) setPage(page - 1);
    setComments(existing =>  existing.concat(res.results));
  }

  return (
    <div className={styles.PostPage} data-testid="Post">
      <SidebarButtons/>
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.PostPageContent}>
        <div className={`${styles.Content} ${props.post && props.post.type === 'post' ? styles.PostType : ''}`}>
          <PostBox newComment={newComment} post={props.post} isLiked={isLiking}/>
          {
            account &&
              <div className={styles.NewComment}>
                  <PostInput key={'post'} onNewPost={newComment} parentHash={props.hash}/>
              </div>
          }
          <div className={styles.Separator}></div>
          <Comments feed={comments} loadNext={loadMoreComments}/>
          {(!fullyLoadedComments) && <div className={styles.NoComments}><CircularProgress size={60}/></div>}
          {(fullyLoadedComments && comments.length === 0) &&
          <div className={styles.NoComments}>
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
