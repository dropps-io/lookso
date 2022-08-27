import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './Activity.module.scss';

import PostBox, {FeedPost} from "../PostBox/PostBox";
import {POSTS_PER_LOAD} from "../../environment/constants";
import {timer} from "../../core/utils/timer";
import CircularProgress from "@mui/material/CircularProgress";

interface ActivityProps {
  feed: FeedPost[],
  headline: string,
  onFilterChange: (filter: 'all' | 'event' | 'post') => void
  loadNext: (filter: 'all' | 'event' | 'post') => void,
  newPost?: (post: FeedPost) => any,
  onUnfollow?: ((address: string, filter: 'all' | 'post' | 'event') => any)
}

const Activity: FC<ActivityProps> = (props) => {
  const [isListening, setIsListening] = useState(true);
  const [activeFilter, setActiveFilter]: ['all' | 'post' | 'event', any] = useState('all');
  let ref: RefObject<HTMLDivElement> = useRef(null);

  const filters: {display: string, value: 'all' | 'post' | 'event'}[] = [
    {display: 'All', value: 'all'},
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
    if (filters[i].value !== activeFilter) {
      props.onFilterChange(filters[i].value);
      setActiveFilter(filters[i].value);
    }
  }

  useEffect(() => {
    if (isListening) {
      const listener = async (e: any) => {
        if (isScrolledIntoView(ref)) {
          setIsListening(!isListening);
          props.loadNext(activeFilter);
          await timer(1000);
          setIsListening(true);
        }
      }

      document.addEventListener("scroll", listener);

      return () => {
        document.removeEventListener("scroll", listener);
      };
    }
  }, [props.loadNext, isListening, props.onFilterChange])

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
                  <PostBox onUnfollow={(address) => {if (props.onUnfollow) props.onUnfollow(address, activeFilter)}}
                           newRepost={props.newPost} ref={ref} key={post.hash} post={post}/>
                  :
                  <PostBox onUnfollow={(address) => {if (props.onUnfollow) props.onUnfollow(address, activeFilter)}}
                           newRepost={props.newPost} key={post.hash + index} post={post}/>
              )
            }
          </div>
          :
          <div className={styles.Loading}>
            <CircularProgress size={60}/>
          </div>
      }
    </div>
  );
}

export default Activity;
