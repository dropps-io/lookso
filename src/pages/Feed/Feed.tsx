import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {FeedPost} from "../../models/post";
import {fetchProfileFeed} from "../../core/api";

interface FeedProps {}

const Feed: FC<FeedProps> = () => {
  const account = useSelector((state: RootState) => state.web3.account);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);

  useEffect(() => {
    async function initPageData() {
      if (account) {
        setFeed(await fetchProfileFeed(account, 30, 0));
      }
    }

    initPageData();
  }, [account]);

  return (
    <div className={styles.Feed} data-testid="Profile">
      <div className={styles.FeedPageHeader}>
        <Navbar/>
      </div>
      <div className={styles.FeedPageContent}>
        <Activity feed={feed}></Activity>
      </div>
      <Footer/>
    </div>
  );
}

export default Feed;
