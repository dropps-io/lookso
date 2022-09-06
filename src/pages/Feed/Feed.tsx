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
import {addToStoredFeed, setCurrentFeedFilter, setCurrentFeedTopPosition, setCurrentFeedType, setStoredFeed} from "../../store/feed-reducer";
import {timer} from "../../core/utils/timer";

interface FeedProps {
  type: 'Feed' | 'Explore';
}

const Feed: FC<FeedProps> = (props) => {
  const dispatch = useDispatch();
  const account: string | undefined = useSelector((state: RootState) => state.web3.account);
  const web3Initialized = useSelector((state: RootState) => state.web3.initialized);
  const storedFeed = useSelector((state: RootState) => state.feed.feed);
  const storedFeedCurrentType = useSelector((state: RootState) => state.feed.currentType);
  const storedFeedCurrentFilter = useSelector((state: RootState) => state.feed.currentFilter);
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
      setFullyLoadedActivity(false);

      if (storedFeed.length > 0 && storedFeedCurrentType === props.type) {
        setFeed(storedFeed);
        setOffset(storedFeed.length);
        setNeedToScrollOnNextFeedChange(true);

      } else {
        setFeed([]);

        let newFeed: FeedPost[];
        if (account && props.type === 'Feed') {
          newFeed = await fetchProfileFeed(account, POSTS_PER_LOAD, offset);
        } else {
          newFeed = await fetchAllFeed(POSTS_PER_LOAD, offset, undefined, account);
        }
        if(newFeed.length === 0) setFullyLoadedActivity(true);
        setOffset(newFeed.length);
        setFeed(newFeed);

        // dispatch(setCurrentFeedFilter('all'));
        dispatch(setCurrentFeedType(props.type));
        dispatch(setStoredFeed(newFeed));
      }
    }

    if (initialized && needToScrollOnNextFeedChange && feed.length === storedFeed.length) scrollTo();

    async function scrollTo() {
      window.scrollTo(0, storedFeedCurrentTopPosition);
      await timer(50);
      setNeedToScrollOnNextFeedChange(false);
    }

    if (!initialized && web3Initialized && storedFeedCurrentType && storedFeed) initPageData();
  }, [web3Initialized, account, props.type, feed]);

  async function loadMorePosts(filter: 'all' | 'post' | 'event') {
    if (loading || fullyLoadedActivity) return;
    loading = true;
    console.log('Loading posts... from' + offset);
    dispatch(setCurrentFeedFilter(filter));
    try {
      let newPosts: FeedPost[];
      if (account && props.type === 'Feed') {
        newPosts = await fetchProfileFeed(account, POSTS_PER_LOAD, offset, filter === 'all' ? undefined : filter);
      } else {
        newPosts = await fetchAllFeed(POSTS_PER_LOAD, offset, filter === 'all' ? undefined : filter, account);
      }
      newPosts = newPosts.filter(post => !feed.map(p => p.hash).includes(post.hash));
      setFeed((existing: FeedPost[]) => existing.concat(newPosts));
      if (newPosts.length === 0 || (filter === 'post' && newPosts.length < POSTS_PER_LOAD)) {
        console.log('fully loaded')
        setFullyLoadedActivity(true);
      }
      setOffset(offset + newPosts.length);

      console.log('Loaded ' + newPosts.length + ' new posts');
      dispatch(addToStoredFeed(newPosts));
      await timer(2000)
      loading = false;
    }
    catch (e) {
      console.error(e);
      await timer(2000)
      loading = false;
    }
  }

  async function fetchFeedWithFilter(type: 'all' | 'post' | 'event') {
    dispatch(setCurrentFeedFilter(type));
    setFeed([]);
    setFullyLoadedActivity(false);

    let newPosts: FeedPost[];
    if (account) {
      if (props.type === 'Feed') newPosts = await fetchProfileFeed(account, POSTS_PER_LOAD, 0, type === 'all' ? undefined : type);
      else newPosts = await fetchAllFeed(POSTS_PER_LOAD, 0, type === 'all' ? undefined : type, account);
    } else {
      if (props.type === 'Explore') newPosts = await fetchAllFeed(POSTS_PER_LOAD, 0, type === 'all' ? undefined : type, account);
      else newPosts = [];
    }

    if (newPosts.length === 0 || (type === 'post' && newPosts.length < POSTS_PER_LOAD)) {
      console.log('fully loaded')
      setFullyLoadedActivity(true);
    }

    dispatch(setStoredFeed(newPosts));
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
        <title>{props.type} | LOOKSO</title>
        <meta name="twitter:card" content={'summary_large_image'}/>
        <meta name="twitter:site" content="@lookso_io"/>
        <meta name="twitter:title" content={`${props.type} | LOOKSO`}/>
        <meta property='twitter:description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
        <meta property='twitter:creator' content='@undeveloped'/>
        <meta name='description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
        <meta property='og:title' content={`${props.type} | LOOKSO`}/>
        <meta property='og:image' itemProp='image' content={'https://lookso.io/_next/static/media/lookso-banner.6b51eb2c.png'}/>
        <meta property='og:description' content={'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'}/>
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
          props.type === 'Feed' && account && fullyLoadedActivity && feed.length === 0 && store && storedFeedCurrentFilter !== 'post' ?
            <div className={styles.NoFollowing}>
              <p>It seems you don’t follow any UP’s yet!</p>
              <span className={styles.Tip}>(tip: you can find new ones through our Explore section or use the search bar to find specific ones)</span>
              <Link href={'/explore'}><button className={'btn btn-main'}>Start exploring!</button></Link>
            </div>
            :
            <Activity
              loading={true}
              feed={feed.filter(p => !p.hided)}
              headline={props.type}
              onFilterChange={(filterValue) => fetchFeedWithFilter(filterValue)}
              newPost={handleNewPost}
              loadNext={(filter) => loadMorePosts(filter)}
              onUnfollow={handleUnfollow}
              end={fullyLoadedActivity}
              onScroll={() => {
                if (initialized && !needToScrollOnNextFeedChange) {
                  dispatch(setCurrentFeedTopPosition(window.scrollY))
                }
              }}
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
