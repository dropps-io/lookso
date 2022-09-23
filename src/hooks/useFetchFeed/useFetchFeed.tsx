import React, {useEffect, useState} from 'react';
import {FeedPost} from "../../components/PostBox/PostBox";
import {useDispatch} from "react-redux";
import {
  fetchAllFeedWithCancellationToken, fetchProfileActivityWithCancellationToken,
  fetchProfileFeedWithCancellationToken
} from "../../core/api";
import {POSTS_PER_LOAD} from "../../environment/constants";
import axios from "axios";

interface UseFetchFeedProps {
  account?: string;
  profile?: string;
  type: 'Explore' | 'Feed' | 'Profile';
  filter: 'all' | 'post' | 'event';
  offset: number;
  posts?: FeedPost[],
  postToAdd?: FeedPost,
  toUnfollow?: string
}
// TODO change props to normal function params
const useFetchFeed = (props: UseFetchFeedProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPosts(props.posts ? props.posts: []);
  }, [props.filter, props.account]);

  useEffect(() => {
    const post = props.postToAdd;
    if (post && !posts.map(p => p.hash).includes(post.hash)) setPosts(existing => [post].concat(existing))
  }, [props.postToAdd]);

  useEffect(() => {
    if (props.toUnfollow) setPosts(existing => existing.filter(p => p.author.address !== props.toUnfollow));
  }, [props.toUnfollow]);

  useEffect(() => {
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

        // We filter the new posts to avoid duplicates
        if (newPosts.length <= POSTS_PER_LOAD) setPosts(existing => existing.concat(newPosts));
        else setPosts(existing => existing.concat(newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash))));
        console.log('Loaded ' + newPosts.filter(post => !posts.map(p => p.hash).includes(post.hash)).length + ' new posts')
      } else setError(true);
      setLoading(false);
    }).catch(e => {
      console.log(e);
      if (axios.isCancel(e)) return;
      setError(true);
    });
    return () => fetch.cancel();
  }, [props.offset, props.filter, props.account])

  return { loading, error, posts, hasMore };
}

export default useFetchFeed;
