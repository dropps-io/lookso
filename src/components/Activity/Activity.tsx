import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './Activity.module.scss';

import Post, {FeedPost} from "../Post/Post";
import {POSTS_PER_LOAD} from "../../environment/constants";
import {timer} from "../../core/utils/timer";

interface ActivityProps {
  feed: FeedPost[],
  headline: string,
  loadNext: () => void
}

const Activity: FC<ActivityProps> = (props) => {
  const [isListening, setIsListening] = useState(true);
  const [activeFilter, setActiveFilter]: [undefined | 'post' | 'event', any] = useState(undefined);
  let ref: RefObject<HTMLDivElement> = useRef(null);

  const filters: {display: string, value?: 'post' | 'event'}[] = [
    {display: 'All', value: undefined},
    {display: 'Posts', value: 'post'},
    {display: 'Events', value: 'event'}
  ];

  function isScrolledIntoView(el: RefObject<HTMLDivElement>) {
    if (el.current) {
      const rect = el.current.getBoundingClientRect();
      const elemTop = rect.top;
      return (elemTop < 0);
    } else {
      return false;
    }
  }

  async function setActive(i: number) {
    // if (filters[i].value !== activeFilter) fetchFeedWithFilter(filters[i].value);
    setActiveFilter(filters[i].value);
  }

  useEffect(() => {
    if (isListening) {
      const listener = async (e: any) => {
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
    <div className={styles.Feed}>
      <div className={styles.FeedHeader}>
        <h5>{props.headline}</h5>
        <div className={styles.Filters}>
          {
            filters.map((filter, index) =>
              <span key={filter.display} onClick={() => setActive(index)} className={`${activeFilter === filter.value ? styles.ActiveFilter : ''}`}>{filter.display}</span>
            )
          }
        </div>
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
