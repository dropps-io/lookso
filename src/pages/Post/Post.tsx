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

interface PostProps {
  hash: string,
  post: FeedPost
}

const Post: FC<PostProps> = (props) => {
  const router = useRouter();
  const account = useSelector((state: RootState) => state.web3.account);
  const [comments, setComments] = useState<FeedPost[]>([]);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    async function init() {
      if (account && !isLiking) {
        const isLiking = await fetchIsLikedPost(account, props.hash);
        if (isLiking) {
          setIsLiking(true);
        }
      }
      const comments = await fetchPostComments(props.hash, 30, 0, account);
      if (router.query.newComment) {
        const newComment: FeedPost = JSON.parse(router.query.newComment as string);
        if (!comments.map(c => c.hash).includes(newComment.hash)) comments.unshift(newComment);
      }
      setComments(comments);
    }

    if(props.hash) init();
  }, [props.hash, account]);

  function newComment(comment: FeedPost) {
    setComments(existing => [comment].concat(existing));
  }

  return (
    <div className={styles.PostPage} data-testid="Post">
      <SidebarButtons/>
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.PageContent}>
        <PostBox newComment={newComment} post={props.post} isLiked={isLiking}/>
        <Comments feed={comments} loadNext={() => {}}/>
      </div>
    </div>
  );
}

export default Post;
