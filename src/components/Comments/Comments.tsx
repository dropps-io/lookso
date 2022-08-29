import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './Comments.module.scss';
import {timer} from "../../core/utils/timer";
import {POSTS_PER_LOAD} from "../../environment/constants";
import PostBox, {FeedPost} from "../PostBox/PostBox";

interface CommentsProps {
  feed: FeedPost[],
  loadNext: () => void
}

const Comments: FC<CommentsProps> = (props) => {
  const [isListening, setIsListening] = useState(true);
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
  }, [props.loadNext, isListening])

  return (
    <div className={styles.Comments}>
      {
        props.feed && props.feed.length > 0 ?
          <div className={styles.FeedPosts}>
            {
              props.feed.map((post, index) =>
                <>
                  {
                    index !== 0 && <div key={'separator' + post.hash} className={styles.Separator}/>
                  }
                  {
                    index === props.feed.length - (POSTS_PER_LOAD / 2) ?
                      <PostBox ref={ref} key={post.hash + index} post={post} comment/> :
                      <PostBox key={post.hash + index} post={post} comment/>
                  }
                </>
              )
            }
          </div>
          :
          <></>
      }
    </div>
  );
}

export default Comments;
