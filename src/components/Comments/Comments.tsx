import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './Comments.module.scss';
import {timer} from "../../core/utils/timer";
import PostBox, {FeedPost} from "../PostBox/PostBox";
import SubComments from "../SubComments/SubComments";

interface CommentsProps {
  feed: FeedPost[],
  loadNext: () => void,
  account: string
}

const Comments: FC<CommentsProps> = (props) => {
  const [isListening, setIsListening] = useState(true);
  const [showReplies, setShowReplies] = useState<Map<string, boolean>>(new Map<string, boolean>());
  let ref: RefObject<HTMLDivElement> = useRef(null);

  function isScrolledIntoView(el: RefObject<HTMLDivElement>) {
    if (el.current) {
      const rect = el.current.getBoundingClientRect();
      const elemTop = rect.top;
      return (elemTop < 0);
    } else {
      return false;
    }
  }

  useEffect(() => {
    if (isListening) {
      const listener = async () => {
        if (isScrolledIntoView(ref)) {
          setIsListening(!isListening);
          props.loadNext();
          await timer(1000);
          setIsListening(true);
        }
      }

      document.addEventListener("scroll", listener);

      return () => {
        document.removeEventListener("scroll", listener);
      };
    }
  }, [props.loadNext, isListening, showReplies]);

  function showRepliesOf(hash: string) {
    setShowReplies(new Map(showReplies.set(hash, true)));
  }

  return (
    <div className={styles.Comments}>
      {
        props.feed && props.feed.length > 0 ?
          <div className={styles.FeedPosts}>
            {props.feed.map((post, index) => <>
              {index !== 0 && <div key={'separator' + post.hash} className={styles.Separator}/>}
              <div className={styles.Comment}>
                {
                  post.comments > 0 &&
                    <div key={'comment-line' + post.hash} className={styles.CommentLine}/>
                }
                <div className={styles.PostBox}>
                  {
                    index === props.feed.length - (15 / 2) ?
                      <PostBox ref={ref} key={post.hash + index} post={post} comment/> :
                      <PostBox key={post.hash + index} post={post} comment/>
                  }
                </div>
                {post.comments > 0 &&
                    <div className={styles.ShowReplies}>
                      {
                        showReplies.get(post.hash) ?
                          <SubComments commentsAmount={post.comments} commentHash={post.hash} account={props.account}/>
                          :
                          <a onClick={() => showRepliesOf(post.hash)}>Show replies</a>
                      }
                    </div>
                }
              </div>
            </>
            )}
          </div>
          :
          <></>
      }
    </div>
  );
}

export default Comments;
