import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useSelector} from "react-redux";
import {RootState, store} from "../../store/store";
import {fetchAllFeed, fetchProfileFeed} from "../../core/api";
import {FeedPost} from "../../components/Post/Post";
import PostInput from "../../components/PostInput/PostInput";
import Head from "next/head";
import {POSTS_PER_LOAD} from "../../environment/constants";

interface FeedProps {}

const Feed: FC<FeedProps> = () => {
  const account = useSelector((state: RootState) => state.web3.account);
  const web3Initialized = useSelector((state: RootState) => state.web3.initialized);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);
  const [fullyLoadedActivity, setFullyLoadedActivity] = useState(false);
  const [offset, setOffset] = useState(POSTS_PER_LOAD);

  let loading = false;
  useEffect(() => {
    async function initPageData() {
      setFeed([]);
      setOffset(POSTS_PER_LOAD);
      setFullyLoadedActivity(false);

      if (account) {
        setFeed(await fetchProfileFeed(account, POSTS_PER_LOAD, 0));
      } else {
        setFeed(await fetchAllFeed(POSTS_PER_LOAD, 0));
      }
    }

    if (web3Initialized) initPageData();
  }, [web3Initialized, account]);

  async function loadMorePosts() {
    if (loading || fullyLoadedActivity) return;
    console.log('Loading posts... from' + offset);
    try {
      loading = true;
      let newPosts: FeedPost[];
      if (store.getState().web3.account) {
        newPosts = await fetchProfileFeed(store.getState().web3.account, POSTS_PER_LOAD, offset, undefined);
      } else {
        newPosts = await fetchAllFeed(POSTS_PER_LOAD, offset, undefined);
      }
      setFeed((existing: FeedPost[]) => existing.concat(newPosts));
      if (newPosts.length === 0) setFullyLoadedActivity(true);
      setOffset(offset + POSTS_PER_LOAD);
      loading = false;
    }
    catch (e) {
      console.error(e);
      loading = false;
    }
  }

  async function fetchFeedWithFilter(type?: 'post' | 'event') {
    setFeed([]);
    setOffset(POSTS_PER_LOAD);
    if (account) {
      setFeed(await fetchProfileFeed(account, POSTS_PER_LOAD, 0, type));
    } else {
      setFeed(await fetchAllFeed(POSTS_PER_LOAD, 0, type));
    }
  }

  function handleNewPost(post: FeedPost) {
    setFeed((existing: FeedPost[]) => [post].concat(existing));
  }

  return (
    <div className={styles.Feed} data-testid="Feed">
      <Head>
        <title>Feed | Lookso</title>
      </Head>
      <div className={styles.FeedPageHeader}>
        <Navbar/>
      </div>
      <div className={styles.FeedPageContent}>
        {
          account ?
            <div className={styles.PostWritingBox}>
              <PostInput onNewPost={handleNewPost}/>
            </div>
            :
            <></>
        }
        <Activity feed={feed} headline='Feed' loadNext={() => loadMorePosts()}></Activity>
      </div>
      <Footer/>
    </div>
  );
}

export default Feed;
