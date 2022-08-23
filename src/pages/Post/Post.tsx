import React, {FC, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import PostBox, {FeedPost, initialFeedPost} from "../../components/PostBox/PostBox";
import {fetchPost, fetchPostComments} from "../../core/api";
import Navbar from "../../components/Navbar/Navbar";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import Comments from "../../components/Comments/Comments";

interface PostProps {
  hash: string
}

const Post: FC<PostProps> = (props) => {
  const account = useSelector((state: RootState) => state.web3.account);
  const [post, setPost] = useState<FeedPost>(initialFeedPost);
  const [comments, setComments] = useState<FeedPost[]>([]);

  useEffect(() => {
    async function init() {
      if (props.hash) {
        setPost(await fetchPost(props.hash, account));
        setComments(await fetchPostComments(props.hash, 30, 0, account))
      }
    }

    init();
  }, [props.hash, account])

  return (
    <div className={styles.PostPage} data-testid="Post">
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.PageContent}>
        <PostBox post={post}/>
        <Comments feed={comments} loadNext={() => {}}/>
      </div>
    </div>
  );
}

export default Post;
