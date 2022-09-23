import React, {useEffect, useState} from 'react';
import {FeedPost} from "../components/PostBox/PostBox";
import {fetchAllFeedWithCancellationToken, fetchProfileActivityWithCancellationToken, fetchProfileFeedWithCancellationToken} from "../core/api";
import {POSTS_PER_LOAD} from "../environment/constants";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/store";
import {setCurrentFeedFilter, setCurrentFeedType, setCurrentOffset, setStoredFeed} from "../store/feed-reducer";

interface UseFetchFeedProps {
  account?: string;
  profile?: string;
  type: 'Explore' | 'Feed' | 'Profile';
  filter: 'all' | 'post' | 'event';
  offset: number;
  postToAdd?: FeedPost,
  toUnfollow?: string
}
// TODO change props to normal function params
const useFetchFeed = (props: UseFetchFeedProps) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'post' | 'event'>('all');
  const [initialized, setInitialized] = useState(false);

  const storedPosts = useSelector((state: RootState) => state.feed.feed);
  const storedType = useSelector((state: RootState) => state.feed.currentType);
  const storedFilter = useSelector((state: RootState) => state.feed.currentFilter);

  useEffect(() => {
    setLoading(true)
    let fetch: {promise: Promise<any>, cancel: any};

    if (storedType === props.type && storedPosts.length > 0) {
      setTimeout(() => {
        setPosts(storedPosts);
        setFilter(storedFilter);
        setLoading(false);
      }, 1)
    }
    else {
      console.log('inelse')
      setLoading(true);
      setError(false);
      dispatch(setCurrentOffset(props.offset));
      dispatch(setCurrentFeedType(props.type));

      if (props.account && props.type === 'Feed') fetch = fetchProfileFeedWithCancellationToken(props.account, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter);
      else if (props.type === 'Explore') fetch = fetchAllFeedWithCancellationToken(POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
      else if (props.type === 'Profile' && props.profile) fetch = fetchProfileActivityWithCancellationToken(props.profile, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
      else return;

      console.log('Loading more posts... from ' + props.offset);

      fetch.promise
        .then(res => {
          if (res.status === 200) {
            const newPosts = res.data as FeedPost[];
            setHasMore(newPosts.length !== 0);

            // We filter the new posts to avoid duplicates, but we do it only if the filter did not change
            if (filter !== props.filter) setPosts(existing => {
              const feed = existing.concat(newPosts);
              dispatch(setStoredFeed(feed));
              return feed;
            });
            else setPosts(existing => {
              const feed = existing.concat(newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)));
              dispatch(setStoredFeed(feed));
              return feed;
            });
            console.log('Loaded ' + newPosts.length + ' new posts')
            console.log('Filtered to ' + newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)).length + ' new posts')
          } else setError(true);
          setLoading(false);
        })
        .catch(e => {
          console.log(e);
          if (axios.isCancel(e)) return;
          setError(true);
     });
    }
    setTimeout(() => {
      setInitialized(true);
    }, 100)
    return () => {
      if (fetch) fetch.cancel();
    }
  }, [])

  // TODO in case of Log in, just updated the like status of posts
  useEffect(() => {
    if (!initialized) return;

    setPosts([]);
    dispatch(setStoredFeed([]));
    setFilter(props.filter);
    dispatch(setCurrentFeedFilter(props.filter));
    dispatch(setCurrentFeedType(props.type));
  }, [props.filter, props.account, props.type]);

  useEffect(() => {
    if (!initialized) return;

    const post = props.postToAdd;
    if (post && !posts.map(p => p.hash).includes(post.hash)) setPosts(existing => [post].concat(existing))
  }, [props.postToAdd]);

  useEffect(() => {
    if (!initialized) return;
    if (props.toUnfollow) setPosts(existing => {
      const feed = existing.filter(p => p.author.address !== props.toUnfollow);
      dispatch(setStoredFeed(feed));
      return feed;
    });
  }, [props.toUnfollow]);

  useEffect(() => {
    if (!initialized) return;

    setLoading(true);
    setError(false);

    let fetch: {promise: Promise<any>, cancel: any};
    if (props.account && props.type === 'Feed') fetch = fetchProfileFeedWithCancellationToken(props.account, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter);
    else if (props.type === 'Explore') fetch = fetchAllFeedWithCancellationToken(POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
    else if (props.type === 'Profile' && props.profile) fetch = fetchProfileActivityWithCancellationToken(props.profile, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
    else return;

    console.log('Loading more posts... from ' + props.offset);

    fetch.promise.then(res => {
      if (res.status === 200) {
        const newPosts = res.data as FeedPost[];
        setHasMore(newPosts.length !== 0);

        // We filter the new posts to avoid duplicates, but we do it only if the filter did not change
        if (filter !== props.filter) setPosts(existing => {
          const feed = existing.concat(newPosts);
          dispatch(setStoredFeed(feed));
          return feed;
        });
        else setPosts(existing => {
          const feed = existing.concat(newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)));
          dispatch(setStoredFeed(feed));
          return feed;
        });
        dispatch(setCurrentOffset(props.offset));
        console.log('Loaded ' + newPosts.length + ' new posts')
        console.log('Filtered to ' + newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)).length + ' new posts')
      } else setError(true);
      setLoading(false);
    }).catch(e => {
      console.log(e);
      if (axios.isCancel(e)) return;
      setError(true);
    });
    return () => fetch.cancel();
  }, [props.offset, props.filter, props.account]);

  return { loading, error, posts, hasMore };
}

export default useFetchFeed;
