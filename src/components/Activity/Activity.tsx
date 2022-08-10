import React, {FC} from 'react';
import styles from './Activity.module.scss';

import Post, {FeedPost} from "../Post/Post";

interface ActivityProps {
  feed: FeedPost[]
}

const Activity: FC<ActivityProps> = (props) => {

  return (
    <div className={styles.Feed}>
      <div className={styles.FeedHeader}>
        <h5>Activity</h5>
      </div>
      <div className={styles.FeedPosts}>
        {
          props.feed.map((post, index) =>
            <Post key={index} post={post}/>
          )
        }
      </div>
    </div>
  );
}

export default Activity;
