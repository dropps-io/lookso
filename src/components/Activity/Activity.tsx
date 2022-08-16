import React, {FC, RefObject, useEffect, useRef} from 'react';
import styles from './Activity.module.scss';

import Post, {FeedPost} from "../Post/Post";
import {POSTS_PER_LOAD} from "../../environment/constants";

interface ActivityProps {
  feed: FeedPost[],
  loadNext?: () => void
}

const Activity: FC<ActivityProps> = (props) => {
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
    if (props.loadNext) {
      ['resize','scroll'].forEach( eventName => {
        window.addEventListener(eventName, () => {
          if (props.loadNext && isScrolledIntoView(ref)) {
            props.loadNext();
          }
        });
      });
    }
  }, [])

  return (
    <div className={styles.Feed} onScroll={() => console.log('scroll')}>
      <div className={styles.FeedHeader}>
        <h5>Activity</h5>
      </div>
      {
        props.feed && props.feed.length > 0 ?
          <div className={styles.FeedPosts}>
            {
              props.feed.map((post, index) =>
                index === props.feed.length - (POSTS_PER_LOAD / 2) ?
                  <Post ref={ref} key={index} post={post}/>
                  :
                  <Post key={index} post={post}/>
              )
            }
          </div>
          :
          <></>
      }
    </div>
  );
}

export default Activity;
