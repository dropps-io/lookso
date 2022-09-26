import React, {useEffect, useState} from 'react';
import {FeedPost} from "../components/PostBox/PostBox";
import {POSTS_PER_LOAD} from "../environment/constants";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/store";
import {setCurrentFeedFilter, setCurrentOffset, setStoredFeed} from "../store/feed-reducer";
import {fetchAllFeed, fetchProfileActivity, fetchProfileFeed} from "../core/api";

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
  const [currentFilter, setCurrentFilter] = useState<'all' | 'post' | 'event'>('all');
  const [currentAccount, setCurrentAccount] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  const storedPosts = useSelector((state: RootState) => state.feed.feed);
  const storedFilter = useSelector((state: RootState) => state.feed.currentFilter);

  useEffect(() => {
    setLoading(true);

    console.log('load from ' + props.offset)

    let fetch: {promise: Promise<any>, cancel: any};

    if (storedPosts[props.type].length > 0 && !(props.type === 'Profile' && storedPosts.Profile[0] && storedPosts.Profile[0].author.address !== props.profile)) {
      setTimeout(() => {
        setPosts(storedPosts[props.type]);
        setCurrentFilter(storedFilter[props.type]);
        setLoading(false);
        setInitialized(true);
      }, 1)
    }
    else {
      setLoading(true);
      setError(false);
      setPosts([]);
      dispatch(setCurrentOffset({type: props.type, offset: props.offset + POSTS_PER_LOAD}));

      if (props.account && props.type === 'Feed') fetch = fetchProfileFeed(props.account, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter);
      else if (props.type === 'Explore') fetch = fetchAllFeed(POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
      else if (props.type === 'Profile' && props.profile) fetch = fetchProfileActivity(props.profile, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
      else {
        setInitialized(true);
        return;
      }

      fetch.promise
        .then(res => {
          if (res.status === 200) {
            const newPosts = res.data as FeedPost[];
            setHasMore(newPosts.length !== 0);

            // We filter the new posts to avoid duplicates, but we do it only if the filter did not change
            if (currentFilter !== props.filter) {
              setPosts(newPosts);
              dispatch(setStoredFeed({type: props.type, feed: newPosts}));
            }
            else {
              setPosts(newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)));
              dispatch(setStoredFeed({type: props.type, feed: newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash))}));
            }
          } else setError(true);
          setLoading(false);
          setInitialized(true);
        })
        .catch(e => {
          console.log(e);
          if (axios.isCancel(e)) return;
          setError(true);
     });
    }
    return () => {
      if (fetch) fetch.cancel();
    }
  }, [props.profile])

  // TODO in case of Log in, just updated the like status of posts
  useEffect(() => {
    setCurrentAccount(props.account);

    if (!initialized) return;

    setPosts([]);
    dispatch(setStoredFeed({type: props.type, feed: []}));
    setCurrentFilter(props.filter);
    dispatch(setCurrentFeedFilter({type: props.type, filter: props.filter}));
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
      dispatch(setStoredFeed({type: props.type, feed}));
      return feed;
    });
  }, [props.toUnfollow]);

  useEffect(() => {
    if (!initialized) return;

    setLoading(true);
    setError(false);

    console.log('load from ' + props.offset)

    let fetch: {promise: Promise<any>, cancel: any};
    if (props.account && props.type === 'Feed') fetch = fetchProfileFeed(props.account, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter);
    else if (props.type === 'Explore') fetch = fetchAllFeed(POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
    else if (props.type === 'Profile' && props.profile) fetch = fetchProfileActivity(props.profile, POSTS_PER_LOAD, props.offset, props.filter === 'all' ? undefined : props.filter, props.account);
    else return;

    fetch.promise.then(res => {
      if (res.status === 200) {
        const newPosts = res.data as FeedPost[];
        setHasMore(newPosts.length !== 0);

        // We filter the new posts to avoid duplicates, but we do it only if the filter did not change
        if (currentFilter !== props.filter || props.account !== currentAccount) setPosts(existing => {
          const feed = existing.concat(newPosts);
          dispatch(setStoredFeed({type: props.type, feed}));
          return feed;
        });
        else setPosts(existing => {
          const feed = existing.concat(newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)));
          dispatch(setStoredFeed({type: props.type, feed}));
          return feed;
        });
        dispatch(setCurrentOffset({type: props.type, offset: props.offset + POSTS_PER_LOAD}));
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
