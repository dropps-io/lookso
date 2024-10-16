import React, { type FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import styles from './NotificationsModal.module.scss';
import CustomModal from '../../CustomModal/CustomModal';
import { type Notification } from '../../../models/notification';
import { fetchProfileNotifications, setProfileNotificationsToViewed } from '../../../core/api/api';
import bell from '../../../assets/icons/bell-filled-purple.svg';
import { formatUrl } from '../../../core/utils/url-formating';
import { DEFAULT_PROFILE_IMAGE } from '../../../core/utils/constants';
import UserTag from '../../UserTag/UserTag';
import { type RootState } from '../../../store/store';

interface NotificationsModalProps {
  account: string;
  open: boolean;
  onClose: () => any;
}

const NotificationsModal: FC<NotificationsModalProps> = props => {
  const router = useRouter();
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      setInitialized(true);
      setNotifications((await fetchProfileNotifications(props.account, 0)).results);
    };

    if (props.account && !initialized && props.open) init();
  }, [props.open, props.account, web3]);

  async function onClose() {
    if (web3 && !notifications.every(n => n.viewed)) {
      await setProfileNotificationsToViewed(props.account, router.asPath, web3);
    }
    props.onClose();
  }

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
    onClose();
  }

  function goToPost(hash?: string) {
    if (hash) router.push('/Post/' + hash);
    onClose();
  }

  return (
    <CustomModal open={props.open} onClose={onClose}>
      <div className={styles.NotificationsModal}>
        <div className={styles.LeftPart}>
          <img src={bell.src} alt="" />
        </div>
        <div className={styles.Notifications}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div
                key={index}
                className={`${styles.Notification} ${notification.viewed ? styles.Viewed : ''}`}
              >
                <div
                  onClick={() => {
                    goToProfile(notification.sender.address);
                  }}
                  className={styles.ProfileImgMedium}
                  style={{
                    backgroundImage: `url(${
                      notification.sender.image
                        ? formatUrl(notification.sender.image)
                        : DEFAULT_PROFILE_IMAGE
                    })`,
                  }}
                />
                <p>
                  {notification.type === 'like' ? (
                    <span
                      onClick={() => {
                        goToPost(notification.postHash);
                      }}
                      className={styles.NotificationText}
                    >
                      <UserTag
                        username={notification.sender.name}
                        address={notification.sender.address}
                      />{' '}
                      <span>liked your post</span>
                    </span>
                  ) : (
                    <></>
                  )}
                  {notification.type === 'follow' ? (
                    <span
                      onClick={() => {
                        goToProfile(notification.sender.address);
                      }}
                      className={styles.NotificationText}
                    >
                      <UserTag
                        username={notification.sender.name}
                        address={notification.sender.address}
                      />{' '}
                      <span>followed you</span>
                    </span>
                  ) : (
                    <></>
                  )}
                  {notification.type === 'repost' ? (
                    <span
                      onClick={() => {
                        goToPost(notification.postHash);
                      }}
                      className={styles.NotificationText}
                    >
                      <UserTag
                        username={notification.sender.name}
                        address={notification.sender.address}
                      />{' '}
                      <span>reposted your post</span>
                    </span>
                  ) : (
                    <></>
                  )}
                  {notification.type === 'comment' ? (
                    <span
                      onClick={() => {
                        goToPost(notification.postHash);
                      }}
                      className={styles.NotificationText}
                    >
                      <UserTag
                        username={notification.sender.name}
                        address={notification.sender.address}
                      />{' '}
                      <span>commented your post</span>
                    </span>
                  ) : (
                    <></>
                  )}
                  {notification.type === 'tag' ? (
                    <span
                      onClick={() => {
                        goToPost(notification.postHash);
                      }}
                      className={styles.NotificationText}
                    >
                      <UserTag
                        username={notification.sender.name}
                        address={notification.sender.address}
                      />{' '}
                      <span>tagged you in a post</span>
                    </span>
                  ) : (
                    <></>
                  )}
                </p>
              </div>
            ))
          ) : (
            <p>No notifications yet 🤷‍</p>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default NotificationsModal;
