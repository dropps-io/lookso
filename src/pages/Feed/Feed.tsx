import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useSelector} from "react-redux";
import {RootState, store} from "../../store/store";
import {FeedPost} from "../../components/PostBox/PostBox";
import PostInput from "../../components/PostInput/PostInput";
import Head from "next/head";
import {POSTS_PER_LOAD} from "../../environment/constants";
import SidebarButtons from "../../components/SidebarButtons/SidebarButtons";
import Link from "next/link";
import {WEBSITE_URL} from "../../environment/endpoints";
import looksoBanner from "../../assets/images/lookso-banner.png";
import useFetchFeed from "../../hooks/useFetchFeed";

interface FeedProps {
  type: 'Feed' | 'Explore';
}

const Feed: FC<FeedProps> = (props) => {
  const account: string | undefined = useSelector((state: RootState) => state.web3.account);
  const storedOffset = useSelector((state: RootState) => state.feed.currentOffset);
  const storedFilter = useSelector((state: RootState) => state.feed.currentFilter);

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<'all' | 'post' | 'event'>('all');
  const [postToAdd, setPostToAdd] = useState<FeedPost | undefined>(undefined);
  const [addressToUnfollow, setAddressToUnfollow] = useState('');

  const {
    posts,
    hasMore,
    loading,
    error
  } = useFetchFeed({type: props.type, offset, filter, postToAdd, account, toUnfollow: addressToUnfollow});

  useEffect(() => {
    setTimeout(() => {
      setOffset(storedOffset[props.type]);
      setFilter(storedFilter[props.type]);
    }, 1);
  }, []);

  useEffect(() => {
    setOffset(0);
  }, [account]);

  async function loadMorePosts() {
    if (loading || !hasMore) return;
    setOffset(offset + POSTS_PER_LOAD);
  }

  async function changeFilter(newFilter: 'all' | 'post' | 'event') {
    if (filter !== newFilter) {
      setOffset(0);
      setFilter(newFilter);
    }
  }

  function handleNewPost(post: FeedPost) {
    setPostToAdd(post);
  }

  function handleUnfollow (address: string) {
    setAddressToUnfollow(address);
    setOffset(posts.length + POSTS_PER_LOAD);
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
        <meta property='og:image' itemProp='image' content={WEBSITE_URL + looksoBanner.src}/>
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
          props.type === 'Feed' && account && !hasMore && posts.length === 0 && store && filter !== 'post' ?
            <div className={styles.NoFollowing}>
              <p>It seems you don’t follow any UP’s yet!</p>
              <span className={styles.Tip}>(tip: you can find new ones through our Explore section or use the search bar to find specific ones)</span>
              <Link href={'/explore'}><button className={'btn btn-main'}>Start exploring!</button></Link>
            </div>
            :
            <Activity
              type={props.type}
              loading={loading}
              feed={posts.filter(p => !p.hided)}
              headline={props.type}
              onFilterChange={(filterValue) => changeFilter(filterValue)}
              newPost={handleNewPost}
              loadNext={loadMorePosts}
              onUnfollow={handleUnfollow}
              end={!hasMore}
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
