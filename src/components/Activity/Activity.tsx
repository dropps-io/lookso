import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './Activity.module.scss';

import PostBox, {FeedPost} from "../PostBox/PostBox";
import {POSTS_PER_LOAD} from "../../environment/constants";
import {timer} from "../../core/utils/timer";
import CircularProgress from "@mui/material/CircularProgress";
import {useRouter} from "next/router";
import {RootState} from "../../store/store";
import {useSelector} from "react-redux";

interface ActivityProps {
  feed: FeedPost[],
  headline: string,
  onFilterChange: (filter: 'all' | 'event' | 'post') => void
  loadNext: (filter: 'all' | 'event' | 'post') => void,
  newPost?: (post: FeedPost) => any,
  onUnfollow?: ((address: string, filter: 'all' | 'post' | 'event') => any),
  end?: boolean,
  onScroll?: () => any,
  loading?: boolean
}

const Activity: FC<ActivityProps> = (props) => {
  const router = useRouter();
  const storedFilter = useSelector((state: RootState) => state.feed.currentFilter);
  const [isListening, setIsListening] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'post' | 'event'>('all');
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
      const listener = async () => {
        if (isScrolledIntoView(ref) && storedFilter) {
          setIsListening(!isListening);
          props.loadNext(router.asPath.includes('Profile') ? activeFilter : storedFilter);
          await timer(3000);
          setIsListening(true);
        }
        if (props.onScroll) props.onScroll();
      }

      document.addEventListener("scroll", listener);

      return () => {
        document.removeEventListener("scroll", listener);
      };
    }

    if (!router.asPath.includes('Profile')) {
      setActiveFilter(storedFilter);
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
          <></>
      }
      {
        props.loading !== undefined && !props.loading && router.asPath.includes('Profile') ?
          props.feed.length === 0 &&
            <div className={styles.Loading}>
              <p>This profile has no posts yet 🤷</p>
            </div> :
          (props.loading && !props.end) &&
          <div className={styles.Loading}>
            <CircularProgress size={60}/>
          </div>
      }
      {
        props.end &&
          <div className={styles.FeedEnd}>
              <p>Looks like you reached the end of the feed 😔</p>
              <button onClick={() => props.onFilterChange(activeFilter)} className={'btn btn-secondary'}>Refresh</button>
          </div>
      }
    </div>
  );
}

export default Activity;
