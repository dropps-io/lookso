import React, {FC, useEffect, useState} from 'react';
import styles from './Post.module.scss';
import PostBox, {FeedPost, initialFeedPost} from "../../components/PostBox/PostBox";
import {fetchPost, fetchPostComments} from "../../core/api";
import Navbar from "../../components/Navbar/Navbar";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import Comments from "../../components/Comments/Comments";
import {useRouter} from "next/router";

interface PostProps {
  hash: string
}

const Post: FC<PostProps> = (props) => {
  const router = useRouter();
  const account = useSelector((state: RootState) => state.web3.account);
  const [post, setPost] = useState<FeedPost>(initialFeedPost);
  const [comments, setComments] = useState<FeedPost[]>([]);

  useEffect(() => {
    async function init() {
      if (router.query.post) {
        setPost(JSON.parse(router.query.post as string));
      } else {
        setPost(await fetchPost(props.hash, account));
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
    console.log(comment)
    setComments(existing => [comment].concat(existing));
  }

  return (
    <div className={styles.PostPage} data-testid="Post">
      <div className={styles.Header}><Navbar/></div>
      <div className={styles.PageContent}>
        <PostBox newComment={newComment} post={post}/>
        <Comments feed={comments} loadNext={() => {}}/>
      </div>
    </div>
  );
}

export default Post;
