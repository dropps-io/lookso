import React, {FC, useEffect, useState} from 'react';
import styles from './SubComments.module.scss';
import PostBox, {FeedPost} from "../PostBox/PostBox";
import {fetchPostComments} from "../../core/api";
import {SUB_COMMENTS_PER_LOAD} from "../../environment/constants";

interface SubCommentsProps {
  commentHash: string,
  commentsAmount: number,
  account: string
}

const SubComments: FC<SubCommentsProps> = (props) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [offset, setOffset] = useState(0);
  const [initialized, setInitialized] = useState(false);
  let loading = false;

  useEffect(() => {
    async function init() {
      loading = true;
      setInitialized(true);
      const comments = await fetchPostComments(props.commentHash, SUB_COMMENTS_PER_LOAD, 0, props.account);
      setPosts(comments);
      setOffset(comments.length);
      loading = false;
    }

    if (props.commentHash && !initialized && !loading) init();
    }, []);

  async function loadMoreReplies() {
    if (loading) return;
    loading = true;
    const comments = await fetchPostComments(props.commentHash, SUB_COMMENTS_PER_LOAD, offset, props.account);
    setPosts(existing => existing.concat(comments));
    setOffset(offset + comments.length);
    loading = false;
  }

  return (
    <div className={styles.SubComments} data-testid="SubComments">
      {
        posts.map(post =>
          <div key={post.hash} className={styles.SubComment}>
            <PostBox post={post} comment noPadding/>
          </div>
        )
      }
      {
        (posts.length < props.commentsAmount && !loading) &&
        <div className={styles.MoreReplies}>
          <a onClick={loadMoreReplies}>More replies</a>
        </div>
      }
    </div>
  );
}

export default SubComments;
