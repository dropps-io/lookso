import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useSelector} from "react-redux";
import {RootState, store} from "../../store/store";
import {fetchAllFeed, fetchProfileFeed} from "../../core/api";
import {FeedPost} from "../../components/PostBox/PostBox";
import PostInput from "../../components/PostInput/PostInput";
import Head from "next/head";
import {POSTS_PER_LOAD} from "../../environment/constants";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";

interface FeedProps {
  type: 'Feed' | 'Explore';
}

const Feed: FC<FeedProps> = (props) => {
  const account = useSelector((state: RootState) => state.web3.account);
  const web3Initialized = useSelector((state: RootState) => state.web3.initialized);
  const [feed, setFeed] = useState<FeedPost[]>([])
  const [fullyLoadedActivity, setFullyLoadedActivity] = useState(false);
  const [offset, setOffset] = useState(0);

  let loading = false;
  useEffect(() => {
    async function initPageData() {
      setFeed([]);
      setFullyLoadedActivity(false);

      let newFeed: FeedPost[];
      if (account && props.type === 'Feed') {
        newFeed = await fetchProfileFeed(account, POSTS_PER_LOAD, offset);
      } else {
        newFeed = await fetchAllFeed(POSTS_PER_LOAD, offset, undefined, account);
      }
      setOffset(newFeed.length);
      setFeed(newFeed);
    }

    if (web3Initialized) initPageData();
  }, [web3Initialized, account, props.type]);

  async function loadMorePosts(filter: 'all' | 'post' | 'event') {
    if (loading || fullyLoadedActivity) return;
    // console.log('Loading posts... from' + offset);
    try {
      loading = true;
      let newPosts: FeedPost[];
      if (account && props.type === 'Feed') {
        newPosts = await fetchProfileFeed(store.getState().web3.account, POSTS_PER_LOAD, offset, filter === 'all' ? undefined : filter);
      } else {
        newPosts = await fetchAllFeed(POSTS_PER_LOAD, offset, filter === 'all' ? undefined : filter, account);
      }
      newPosts = newPosts.filter(post => !feed.map(p => p.hash).includes(post.hash));
      setFeed((existing: FeedPost[]) => existing.concat(newPosts));
      if (newPosts.length === 0) setFullyLoadedActivity(true);
      setOffset(offset + newPosts.length);
      loading = false;
    }
    catch (e) {
      console.error(e);
      loading = false;
    }
  }

  async function fetchFeedWithFilter(type: 'all' | 'post' | 'event') {
    setFeed([]);
    setFullyLoadedActivity(false);

    let newPosts: FeedPost[];
    if (account) {
      if (props.type === 'Feed') newPosts = await fetchProfileFeed(account, POSTS_PER_LOAD, 0, type === 'all' ? undefined : type);
      else newPosts = await fetchAllFeed(POSTS_PER_LOAD, 0, type === 'all' ? undefined : type);
    } else {
      if (props.type === 'Explore') newPosts = await fetchAllFeed(POSTS_PER_LOAD, 0, type === 'all' ? undefined : type);
      else newPosts = [];
    }

    setOffset(newPosts.length);
    setFeed(newPosts);
  }

  function handleNewPost(post: FeedPost) {
    setFeed(existing => [post].concat(existing));
  }

  return (
    <div className={styles.Feed} data-testid="Feed">
      <Head>
        <title>{props.type} | Lookso</title>
      </Head>
      <div className={styles.FeedPageHeader}>
        <Navbar/>
      </div>
      <SidebarButtons/>
      <div className={styles.FeedPageContent}>
        {
          account ?
            <div className={styles.PostWritingBox}>
              <PostInput key={'FeedInput'} onNewPost={handleNewPost}/>
            </div>
            :
            <></>
        }
        <Activity
          feed={feed.filter(p => !p.hided)}
          headline={props.type}
          onFilterChange={(filterValue) => fetchFeedWithFilter(filterValue)}
          newPost={handleNewPost}
          loadNext={(filter) => loadMorePosts(filter)}></Activity>
      </div>
      <div className={styles.FeedPageFooter}>
        <Footer/>
      </div>
    </div>
  );
}

export default Feed;
