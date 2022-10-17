import React, {FC, useEffect, useState} from 'react';
import styles from './SubComments.module.scss';
import PostBox, {FeedPost} from "../PostBox/PostBox";
import {fetchPostComments} from "../../core/api";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";

interface SubCommentsProps {
  commentHash: string,
  commentsAmount: number,
}

const SubComments: FC<SubCommentsProps> = (props) => {
  const account = useSelector((state: RootState) => state.web3.account);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState<undefined | number>(undefined);
  const [initialized, setInitialized] = useState(false);
  let loading = false;

  useEffect(() => {
    async function init() {
      loading = true;
      setInitialized(true);
      const res = await fetchPostComments(props.commentHash, undefined, account ? account : undefined);
      setPosts(res.results);
      setPage(res.page - 1);
      loading = false;
    }

    if (props.commentHash && !initialized && !loading) init();
    }, []);

  async function loadMoreReplies() {
    if (loading) return;
    loading = true;
    const res = await fetchPostComments(props.commentHash, page, account ? account : undefined);
    setPosts(existing => existing.concat(res.results));
    if (page) setPage(page - 1);
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
