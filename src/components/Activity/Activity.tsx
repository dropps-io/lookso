import React, {FC, useCallback, useRef, useState} from 'react';
import styles from './Activity.module.scss';

import PostBox, {FeedPost} from "../PostBox/PostBox";
import {POSTS_PER_LOAD} from "../../environment/constants";
import CircularProgress from "@mui/material/CircularProgress";
import {useRouter} from "next/router";

interface ActivityProps {
  feed: FeedPost[],
  headline: string,
  onFilterChange: (filter: 'all' | 'event' | 'post') => void
  loadNext: () => void,
  newPost?: (post: FeedPost) => any,
  onUnfollow?: ((address: string, filter: 'all' | 'post' | 'event') => any),
  end?: boolean,
  onScroll?: () => any,
  loading?: boolean
}

const Activity: FC<ActivityProps> = (props) => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'post' | 'event'>('all');

  const observer: any = useRef();
  const postElementRef = useCallback((node: any) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !props.end) {
        props.loadNext();
      }
    })
    if (node) observer.current.observe(node);
  }, [props.loading, props.end, props.loadNext]);

  const observerEnd: any = useRef();
  const postElementEndRef = useCallback((node: any) => {
    if (observerEnd.current) observerEnd.current.disconnect();
    observerEnd.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !props.end) {
        props.loadNext();
      }
    })
    if (node) observerEnd.current.observe(node);
  }, [props.loading, props.end, props.loadNext]);

  const filters: {display: string, value: 'all' | 'post' | 'event'}[] = [
    {display: 'All', value: 'all'},
    {display: 'Posts', value: 'post'},
    {display: 'Events', value: 'event'}
  ];

  async function setActive(i: number) {
    if (filters[i].value !== activeFilter) {
      props.onFilterChange(filters[i].value);
      setActiveFilter(filters[i].value);
    }
  }

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
                           newRepost={props.newPost} ref={postElementRef} key={post.hash + index} post={post}/>
                  :
                  index === props.feed.length - 1 ?
                    <PostBox onUnfollow={(address) => {if (props.onUnfollow) props.onUnfollow(address, activeFilter)}}
                             newRepost={props.newPost} ref={postElementEndRef} key={post.hash + index} post={post}/>
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
        props.loading !== undefined && !props.loading && router.asPath.includes('Profile') && (props.feed.length === 0 && props.end) &&
          <div className={styles.Loading}>
              <p>This profile has no posts yet 🤷</p>
          </div>
      }
      {
          props.loading &&
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
