import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import PostBox from '../PostBox/PostBox';
import styles from './Activity.module.scss';
import { getFeedActions, getReduxFeedState, type RootState } from '../../store/store';
import TabSelector from '../TabSelector/TabSelector';

interface ActivityProps {
  type: 'Profile' | 'Feed' | 'Explore';
  headline: string;
  onUnfollow?: (address: string) => any;
  profile?: string;
}

const Activity: FC<ActivityProps> = props => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [scrolled, setScrolled] = useState(false);

  const currentPost = useSelector(
    (state: RootState) => getReduxFeedState(state, props.type).currentPost
  );
  const filter = useSelector(
    (state: RootState) => getReduxFeedState(state, props.type).currentFilter
  );
  const posts = useSelector((state: RootState) => getReduxFeedState(state, props.type).feed);
  const loading = useSelector((state: RootState) => getReduxFeedState(state, props.type).loading);
  const hasMore = useSelector((state: RootState) => getReduxFeedState(state, props.type).hasMore);
  const profile = useSelector((state: RootState) => getReduxFeedState(state, props.type).profile);

  const observer: any = useRef();
  const postElementRef = useCallback(
    (node: any) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loading) decrementPage();
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const observerEnd: any = useRef();
  const postElementEndRef = useCallback(
    (node: any) => {
      if (observerEnd.current) observerEnd.current.disconnect();
      observerEnd.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loading) decrementPage();
      });
      if (node) observerEnd.current.observe(node);
    },
    [loading, hasMore]
  );

  const currentPostRef = useRef(null);

  const filters: Array<{ display: string; value: undefined | 'post' | 'event' }> = [
    { display: 'All', value: undefined },
    { display: 'Posts', value: 'post' },
    { display: 'Events', value: 'event' },
  ];

  useEffect(() => {
    if (!scrolled && currentPostRef && currentPostRef.current && props.profile === profile) {
      (currentPostRef.current as any).scrollIntoView({ block: 'center' });
    }
    setScrolled(true);
  }, [posts]);

  function decrementPage() {
    dispatch(getFeedActions(props.type).decrementPage());
  }

  async function setActive(i: number) {
    if (filters[i].value !== filter) {
      dispatch(getFeedActions(props.type).setCurrentFeedFilter(filters[i].value));
    }
  }

  function refresh() {
    dispatch(getFeedActions(props.type).setStoredFeed([]));
    dispatch(getFeedActions(props.type).setCurrentPage(undefined));
  }

  return (
    <div className={styles.Feed}>
      <div className={styles.FeedHeader}>
        <div className={styles.Filters}>
          {filters.map((f, index) => (
            <span
              key={f.display}
              onClick={async () => {
                await setActive(index);
              }}
              className={`${filter === f.value ? styles.ActiveFilter : ''}`}
            >
              {f.display}
            </span>
          ))}
        </div>
      </div>
      {posts && posts.length > 0 ? (
        <div className={styles.FeedPosts}>
          {posts.map((post, index) =>
            post.hash === currentPost ? (
              <PostBox
                onUnfollow={address => {
                  if (props.onUnfollow != null) props.onUnfollow(address);
                }}
                ref={currentPostRef}
                key={post.hash + index}
                post={post}
                type={props.type}
                postHierarchy="main"
              />
            ) : index === posts.length - 15 ? (
              <PostBox
                onUnfollow={address => {
                  if (props.onUnfollow != null) props.onUnfollow(address);
                }}
                ref={postElementRef}
                key={post.hash + index}
                post={post}
                type={props.type}
                postHierarchy="main"
              />
            ) : index === posts.length - 1 ? (
              <PostBox
                onUnfollow={address => {
                  if (props.onUnfollow != null) props.onUnfollow(address);
                }}
                ref={postElementEndRef}
                key={post.hash + index}
                post={post}
                type={props.type}
                postHierarchy="main"
              />
            ) : (
              <PostBox
                onUnfollow={address => {
                  if (props.onUnfollow != null) props.onUnfollow(address);
                }}
                key={post.hash + index}
                post={post}
                type={props.type}
                postHierarchy="main"
              />
            )
          )}
        </div>
      ) : (
        <></>
      )}
      {loading !== undefined &&
        !loading &&
        router.asPath.includes('Profile') &&
        posts.length === 0 &&
        !hasMore && (
          <div className={styles.Loading}>
            <p>This profile has no posts yet 🤷</p>
          </div>
        )}
      {loading && (
        <div className={styles.Loading}>
          <CircularProgress size={60} />
        </div>
      )}
      {!hasMore && (
        <div className={styles.FeedEnd}>
          <p>Looks like you reached the end of the feed 😔</p>
          <button onClick={refresh} className={'btn btn-secondary'}>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default Activity;
