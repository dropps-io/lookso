import React, {FC, useEffect, useState} from 'react';
import styles from './NotificationsModal.module.scss';
import CustomModal from "../../CustomModal/CustomModal";
import {Notification} from "../../../models/notification";
import {fetchProfileNotifications} from "../../../core/api";
import bell from '../../../assets/icons/bell-filled-purple.svg';
import {formatUrl} from "../../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../../core/utils/constants";
import UserTag from "../../UserTag/UserTag";

interface NotificationsModalProps {
  account: string,
  open: boolean,
  onClose: () => any
}

const NotificationsModal: FC<NotificationsModalProps> = (props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const init = async () => {
      if (props.account) setNotifications(await fetchProfileNotifications(props.account));
    }

    init();
  }, [props.open, props.onClose, props.account])

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={styles.NotificationsModal}>
        <div className={styles.LeftPart}>
          <img src={bell.src} alt=""/>
        </div>
        <div className={styles.Notifications}>
          {
            notifications.map((notification, index) =>
              <div key={index} className={styles.Notification}>
                <div className={styles.ProfileImgMedium} style={{backgroundImage: `url(${notification.sender.image ? formatUrl(notification.sender.image) : DEFAULT_PROFILE_IMAGE})`}}/>
                <p>
                  <UserTag username={notification.sender.name} address={notification.sender.address}/>
                  {notification.type === 'like' ? <span> liked your post</span> : <></>}
                  {notification.type === 'follow' ? <span> followed you</span> : <></>}
                  {notification.type === 'repost' ? <span> reposted your post</span> : <></>}
                  {notification.type === 'comment' ? <span> commented your post</span> : <></>}
                </p>
              </div>
            )
          }
        </div>
      </div>
    </CustomModal>
  );
}

export default NotificationsModal;
