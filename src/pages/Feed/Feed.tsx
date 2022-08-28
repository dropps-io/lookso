import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useDispatch, useSelector} from "react-redux";
import {RootState, store} from "../../store/store";
import {fetchAllFeed, fetchProfileFeed} from "../../core/api";
import {FeedPost} from "../../components/PostBox/PostBox";
import PostInput from "../../components/PostInput/PostInput";
import Head from "next/head";
import {POSTS_PER_LOAD} from "../../environment/constants";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";
import Link from "next/link";
import {addToStoredFeed, setCurrentFeedTopPosition, setCurrentFeedType, setStoredFeed} from "../../store/feed-reducer";

interface FeedProps {
  type: 'Feed' | 'Explore';
}

const Feed: FC<FeedProps> = (props) => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.web3.account);
  const web3Initialized = useSelector((state: RootState) => state.web3.initialized);
  const storedFeed = useSelector((state: RootState) => state.feed.feed);
  const storedFeedCurrentType = useSelector((state: RootState) => state.feed.currentType);
  const storedFeedCurrentTopPosition = useSelector((state: RootState) => state.feed.currentTopPosition);
  const [feed, setFeed] = useState<FeedPost[]>([])
  const [fullyLoadedActivity, setFullyLoadedActivity] = useState(false);
  const [offset, setOffset] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [needToScrollOnNextFeedChange, setNeedToScrollOnNextFeedChange] = useState(false);

  let loading = false;
  useEffect(() => {
    async function initPageData() {
      setInitialized(true);
      if (storedFeed.length > 0 && storedFeedCurrentType === props.type) {
        console.log('inIf');
        console.log(storedFeed.length)
        console.log(storedFeedCurrentTopPosition)
        setFeed(storedFeed);
        setFullyLoadedActivity(false);
        setOffset(storedFeed.length);
        setNeedToScrollOnNextFeedChange(true);
      } else {
        console.log('inElse')
        setFeed([]);
        setFullyLoadedActivity(false);

        let newFeed: FeedPost[];
        if (account && props.type === 'Feed') {
          newFeed = await fetchProfileFeed(account, POSTS_PER_LOAD, offset);
        } else {
          newFeed = await fetchAllFeed(POSTS_PER_LOAD, offset, undefined, account);
        }
        if(newFeed.length === 0) setFullyLoadedActivity(true);
        setOffset(newFeed.length);
        setFeed(newFeed);

        dispatch(setCurrentFeedType(props.type));
        dispatch(setStoredFeed(newFeed));
      }
    }

    if (initialized && needToScrollOnNextFeedChange && feed.length === storedFeed.length) {
      setNeedToScrollOnNextFeedChange(false);
      window.scrollTo(0, storedFeedCurrentTopPosition - 100);
    }

    if (!initialized && web3Initialized && storedFeedCurrentType && storedFeed) initPageData();
  }, [web3Initialized, account, props.type, feed]);

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

      dispatch(addToStoredFeed(newPosts));
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

  function handleUnfollow (address: string, filter: 'all' | 'event' | 'post') {
    setFeed(existing => existing.filter(post => post.author.address !== address));
    loadMorePosts(filter);
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
        {
          props.type === 'Feed' && account && fullyLoadedActivity && feed.length === 0 ?
            <div className={styles.NoFollowing}>
              <p>It seems you don’t follow any UP’s yet!</p>
              <span className={styles.Tip}>(tip: you can find new ones through our Explore section or use the search bar to find specific ones)</span>
              <Link href={'/explore'}><button className={'btn btn-main'}>Start exploring!</button></Link>
            </div>
            :
            <Activity
              feed={feed.filter(p => !p.hided)}
              headline={props.type}
              onFilterChange={(filterValue) => fetchFeedWithFilter(filterValue)}
              newPost={handleNewPost}
              loadNext={(filter) => loadMorePosts(filter)}
              onUnfollow={handleUnfollow}
              end={fullyLoadedActivity && feed.length > 0}
              onScroll={(scrollPosition) => dispatch(setCurrentFeedTopPosition(scrollPosition))}
            />
        }

      </div>
      <div className={styles.FeedPageFooter}>
        <Footer/>
      </div>
    </div>
  );
}

export default Feed;
