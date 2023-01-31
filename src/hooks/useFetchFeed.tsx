import React, { useEffect, useState } from 'react';
import axios, { type AxiosPromise } from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import { type FeedPost } from '../components/PostBox/PostBox';
import { getFeedActions, getReduxFeedState, type RootState } from '../store/store';
import { fetchAllFeed, fetchProfileActivity, fetchProfileFeed } from '../core/api/api';
import { type PaginationResponse } from '../models/pagination-response';

interface UseFetchFeedProps {
  type: 'Explore' | 'Feed' | 'Profile';
  postToAdd?: FeedPost;
  toUnfollow?: string;
  profile?: string;
}
// TODO change props to normal function params
const useFetchFeed = (props: UseFetchFeedProps) => {
  const dispatch = useDispatch();

  const [error, setError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const posts = useSelector((state: RootState) => getReduxFeedState(state, props.type).feed);
  const filter = useSelector(
    (state: RootState) => getReduxFeedState(state, props.type).currentFilter
  );
  const page = useSelector((state: RootState) => getReduxFeedState(state, props.type).currentPage);
  const profile = useSelector((state: RootState) => getReduxFeedState(state, props.type).profile);
  const account = useSelector((state: RootState) => state.web3.account);

  useEffect(() => {
    if (!initialized && posts.length > 0 && !(profile && profile !== props.profile)) {
      dispatch(getFeedActions(props.type).setLoading(false));
      setTimeout(() => {
        setInitialized(true);
      }, 200);
      return;
    }
    if (profile && profile !== props.profile)
      dispatch(getFeedActions(props.type).setCurrentFeedFilter(undefined));
    dispatch(getFeedActions(props.type).setLoading(true));
    dispatch(getFeedActions(props.type).setCurrentPost(''));
    dispatch(getFeedActions(props.type).setHasMore(true));
    dispatch(getFeedActions(props.type).setStoredFeed([]));
    setInitialized(false);
    console.log('fetch');

    let fetch: { promise: AxiosPromise; cancel: any };

    if (account && props.type === 'Feed') fetch = fetchProfileFeed(account, undefined, filter);
    else if (props.type === 'Explore')
      fetch = fetchAllFeed(undefined, filter, account || undefined);
    else if (props.type === 'Profile' && props.profile)
      fetch = fetchProfileActivity(props.profile, undefined, filter, account || undefined);
    else return;

    fetch.promise
      .then(res => {
        const data = res.data as Omit<PaginationResponse, 'results'> & { results: FeedPost[] };
        dispatch(getFeedActions(props.type).setStoredFeed(data.results.reverse()));
        if (props.type === 'Profile' && props.profile && props.profile !== profile)
          dispatch(getFeedActions(props.type).setProfile(props.profile));
        if (!data.previous) dispatch(getFeedActions(props.type).setHasMore(false));

        if (data.results.length < 10 && data.page > 0) {
          dispatch(getFeedActions(props.type).setCurrentPage(data.page - 1));
          if (account && props.type === 'Feed')
            fetch = fetchProfileFeed(account, data.page - 1, filter);
          else if (props.type === 'Explore')
            fetch = fetchAllFeed(data.page - 1, filter, account || undefined);
          else if (props.type === 'Profile' && props.profile)
            fetch = fetchProfileActivity(
              props.profile,
              data.page - 1,
              filter,
              account || undefined
            );
          else return;

          fetch.promise
            .then(res => {
              const data2 = res.data as Omit<PaginationResponse, 'results'> & {
                results: FeedPost[];
              };
              dispatch(getFeedActions(props.type).addToStoredFeed(data2.results.reverse()));
              if (!data2.previous) dispatch(getFeedActions(props.type).setHasMore(false));
              dispatch(getFeedActions(props.type).setLoading(false));
              setTimeout(() => {
                setInitialized(true);
              }, 200);
              console.log('fetched ' + data2.results.length);
            })
            .catch(e => {
              console.error(e);
              if (axios.isCancel(e)) return;
              setError(true);
            });
        } else {
          dispatch(getFeedActions(props.type).setCurrentPage(data.page));
          dispatch(getFeedActions(props.type).setLoading(false));
          setTimeout(() => {
            setInitialized(true);
          }, 200);
        }
        console.log('fetched ' + data.results.length);
      })
      .catch(e => {
        console.error(e);
        if (axios.isCancel(e)) return;
        setError(true);
      });

    return () => {
      if (fetch) fetch.cancel();
    };
  }, [filter, account, props.profile]);

  // useEffect(() => {
  //   if (loading || props.type !== 'Profile' || !profile) return;
  //   setLoading(true);
  //
  //   const fetch: {promise: AxiosPromise, cancel: any} = fetchProfileActivity(profile, undefined, filter, account);
  //
  //   fetch.promise.then(res => {
  //     const data = res.data as Omit<PaginationResponse, 'results'> & {results: FeedPost[]};
  //     dispatch(getFeedActions('Profile').setStoredFeed(data.results.reverse()));
  //     dispatch(getFeedActions('Profile').setCurrentPage(data.page - 1));
  //     if (!data.previous) setHasMore(false);
  //     setLoading(false);
  //   })
  //     .catch(e => {
  //       console.error(e);
  //       if (axios.isCancel(e)) return;
  //       setError(true);
  //       setLoading(false);
  //     });
  //
  //   return () => {
  //     if (fetch) fetch.cancel();
  //   }
  // }, [profile]);

  // useEffect(() => {
  //   const post = props.postToAdd;
  //   if (post && !posts.map(p => p.hash).includes(post.hash)) dispatch(getFeedActions(props.type).addToStoredFeed([post]));
  // }, [props.postToAdd]);

  // useEffect(() => {
  // if (props.toUnfollow) setPosts(existing => {
  //   const feed = existing.filter(p => p.author.address !== props.toUnfollow);
  //   dispatch(setStoredFeed({type: props.type, feed}));
  //   return feed;
  // });
  // }, [props.toUnfollow]);

  useEffect(() => {
    if (!initialized) return;
    console.log('new page');
    dispatch(getFeedActions(props.type).setLoading(true));

    let fetch: { promise: AxiosPromise; cancel: any };

    if (account && props.type === 'Feed') fetch = fetchProfileFeed(account, page, filter);
    else if (props.type === 'Explore') fetch = fetchAllFeed(page, filter, account || undefined);
    else if (props.type === 'Profile' && props.profile)
      fetch = fetchProfileActivity(props.profile, page, filter, account || undefined);
    else return;

    fetch.promise
      .then(res => {
        const data = res.data as Omit<PaginationResponse, 'results'> & { results: FeedPost[] };
        dispatch(getFeedActions(props.type).addToStoredFeed(data.results.reverse()));
        if (!data.previous) dispatch(getFeedActions(props.type).setHasMore(false));
        dispatch(getFeedActions(props.type).setLoading(false));
        if (page === undefined && res.data.page > 0)
          dispatch(getFeedActions(props.type).setCurrentPage(res.data.page - 1));
        console.log('fetched new page');
      })
      .catch(e => {
        console.error(e);
        if (axios.isCancel(e)) return;
        setError(true);
      });

    return () => {
      if (fetch) fetch.cancel();
    };
  }, [page]);

  return { error };
};

export default useFetchFeed;
