import React, {FC, useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Navbar from "../../components/Navbar/Navbar";
import Activity from "../../components/Activity/Activity";
import Footer from "../../components/Footer/Footer";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {fetchProfileFeed} from "../../core/api";
import {FeedPost} from "../../components/Post/Post";
import {formatUrl} from "../../core/utils/url-formating";
import {IPFS_GATEWAY} from "../../environment/endpoints";
import PostInput from "../../components/PostInput/PostInput";

interface FeedProps {}

const Feed: FC<FeedProps> = () => {
  const account = useSelector((state: RootState) => state.web3.account);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);
  const [filters, setFilters]: [{display: string, value?: 'event' | 'post',active: boolean}[], any] = useState([
    {display: 'All', value: undefined, active: true},
    {display: 'Posts', value: 'post', active: false},
    {display: 'Events', value: 'event', active: false}
  ]);

  useEffect(() => {
    async function initPageData() {
      if (account) {
        setFeed(await fetchProfileFeed(account, 30, 0));
      }
    }

    initPageData();
  }, [account]);

  async function setActive(i: number) {
    if (!filters[i].active) fetchFeed(filters[i].value);
    setFilters((existing: {display: string, value?: string, active: boolean}[]) => existing.map((f, n) => i === n ? {display: f.display, value: f.value, active: true} : {display: f.display, value: f.value, active: false}));
  }

  async function fetchFeed(type?: 'post' | 'event') {
    setFeed([]);
    setFeed(await fetchProfileFeed(account, 30, 0, type));
  }

  return (
    <div className={styles.Feed} data-testid="Profile">
      <div className={styles.FeedPageHeader}>
        <Navbar/>
      </div>
      <div className={styles.FeedPageContent}>
        <div className={styles.FeedHeader}>
          <h2>Feed</h2>
          <div className={styles.Filters}>
            {
              filters.map((filter, index) =>
                <span key={filter.display} onClick={() => setActive(index)} className={`${filter.active ? styles.ActiveFilter : ''}`}>{filter.display}</span>
              )
            }
          </div>
        </div>
        <div className={styles.PostWritingBox}>
          <PostInput/>
        </div>
        <Activity feed={feed}></Activity>
      </div>
      <Footer/>
    </div>
  );
}

export default Feed;
