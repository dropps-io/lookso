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

interface FeedProps {}

const Feed: FC<FeedProps> = () => {
  const account = useSelector((state: RootState) => state.web3.account);
  const profileImage = useSelector((state: RootState) => state.profile.profileImage);
  const [feed, setFeed]: [FeedPost[], any] = useState([]);
  const [inputHeight, setInputHeight] = useState(70);
  const [inputValue, setInputValue] = useState('');
  const [filters, setFilters]: [{display: string, active: boolean}[], any] = useState([{display: 'All', active: true}, {display: 'Posts', active: false}, {display: 'Events', active: false}]);
  const postInput = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function initPageData() {
      if (account) {
        setFeed(await fetchProfileFeed(account, 30, 0));
      }
    }

    initPageData();
  }, [account]);

  function setActive(i: number) {
    setFilters((existing: {display: string, active: boolean}[]) => existing.map((f, n) => i === n ? {display: f.display, active: true} : {display: f.display, active: false}));
  }

  function textAreaAdjust() {
    if (postInput.current) {
      setInputValue(postInput.current.value);
      if (postInput.current.scrollHeight !== inputHeight)
        setInputHeight(postInput.current.scrollHeight);
    }
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
          <div className={styles.BoxTop}>
            <div className={styles.ProfileImgSmall} style={{backgroundImage: `url(${formatUrl(profileImage, IPFS_GATEWAY)})`}}/>
            <textarea maxLength={256} ref={postInput} className={styles.PostInput} style={{height: `${inputHeight}px`}} onKeyDown={() => textAreaAdjust()} onKeyUp={() => textAreaAdjust()} name="textValue" placeholder="What's happening?"/>
          </div>
          <div className={styles.BoxBottom}>
            <span>{inputValue.length} / 256</span>
            <button className='btn btn-secondary'>Post</button>
          </div>
        </div>
        <Activity feed={feed}></Activity>
      </div>
      <Footer/>
    </div>
  );
}

export default Feed;
