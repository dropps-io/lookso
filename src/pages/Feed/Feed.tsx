import React, { type FC, useState } from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';

import styles from './Feed.module.scss';
import Navbar from '../../components/Navbar/Navbar';
import Activity from '../../components/Activity/Activity';
import Footer from '../../components/Footer/Footer';
import { getReduxFeedState, type RootState, store } from '../../store/store';
import PostInput from '../../components/PostInput/PostInput';
import SidebarButtons from '../../components/SidebarButtons/SidebarButtons';
import { WEBSITE_URL } from '../../environment/endpoints';
import looksoBanner from '../../assets/images/lookso-banner.png';
import useFetchFeed from '../../hooks/useFetchFeed';

interface FeedProps {
  type: 'Feed' | 'Explore';
}

const Feed: FC<FeedProps> = props => {
  const account: string | undefined = useSelector((state: RootState) => state.web3.account);

  const hasMore = useSelector((state: RootState) => getReduxFeedState(state, props.type).hasMore);
  const filter = useSelector(
    (state: RootState) => getReduxFeedState(state, props.type).currentFilter
  );
  const posts = useSelector((state: RootState) => getReduxFeedState(state, props.type)).feed;

  const [addressToUnfollow, setAddressToUnfollow] = useState('');

  useFetchFeed({ type: props.type, toUnfollow: addressToUnfollow });

  function handleUnfollow(address: string) {
    setAddressToUnfollow(address);
  }

  return (
    <div className={styles.Feed} data-testid="Feed">
      <Head>
        <title>{props.type} | LOOKSO</title>
        <meta name="twitter:card" content={'summary_large_image'} />
        <meta name="twitter:site" content="@lookso_io" />
        <meta name="twitter:title" content={`${props.type} | LOOKSO`} />
        <meta
          property="twitter:description"
          content={
            'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'
          }
        />
        <meta property="twitter:creator" content="@undeveloped" />
        <meta
          name="description"
          content={
            'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'
          }
        />
        <meta property="og:title" content={`${props.type} | LOOKSO`} />
        <meta property="og:image" itemProp="image" content={WEBSITE_URL + looksoBanner.src} />
        <meta
          property="og:description"
          content={
            'A decentralized social feed geared towards Universal Profiles and the LUKSO blockchain'
          }
        />
      </Head>
      <div className={styles.FeedPageHeader}>
        <Navbar />
      </div>
      <SidebarButtons />
      <div className={styles.FeedPageContent}>
        {account ? (
          <div className={styles.PostWritingBox}>
            <PostInput key={'FeedInput'} />
          </div>
        ) : (
          <></>
        )}
        {props.type === 'Feed' &&
        account &&
        !hasMore &&
        posts.length === 0 &&
        store &&
        filter !== 'post' ? (
          <div className={styles.NoFollowing}>
            <p>It seems you don’t follow any UP’s yet!</p>
            <span className={styles.Tip}>
              (tip: you can find new ones through our Explore section or use the search bar to find
              specific ones)
            </span>
            <Link href={'/explore'}>
              <button className={'btn btn-main'}>Start exploring!</button>
            </Link>
          </div>
        ) : (
          <Activity type={props.type} headline={props.type} onUnfollow={handleUnfollow} />
        )}
      </div>
      <div className={styles.FeedPageFooter}>
        <Footer />
      </div>
    </div>
  );
};

export default Feed;
