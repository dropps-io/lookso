import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './FollowModal.module.scss';
import {formatUrl} from "../../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../../core/utils/constants";
import UserTag from "../../UserTag/UserTag";
import CustomModal from "../../CustomModal/CustomModal";
import {useSelector} from "react-redux";
import {useRouter} from "next/router";
import {RootState} from "../../../store/store";
import {
  fetchProfileFollowers,
  fetchProfileFollowing,
  insertFollow,
  insertUnfollow
} from "../../../core/api";
import {ProfileFollowingDisplay} from "../../../models/profile";
import CircularProgress from "@mui/material/CircularProgress";

interface FollowModalProps {
  address: string,
  type: 'following' | 'followers',
  open: boolean,
  onClose: () => any,
  onPushToBlockchainRequired: (jsonUrl?: string) => any,
  onFollowChange: (type: 'followers' | 'following', value: -1 | 1) => any;
}

const FollowModal: FC<FollowModalProps> = (props) => {
  const router = useRouter();
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const account = useSelector((state: RootState) => state.web3.account);
  const [profiles, setProfiles] = useState<ProfileFollowingDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [page, setPage] = useState<number | null>(null);
  const [currentAddress, setCurrentAddress] = useState('');

  let ref: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (props.open && props.address !== currentAddress) {
      setPage(0);
      setLoading(false);
      setProfiles([]);
      setFullyLoaded(false);
      setCurrentAddress(props.address);
    }
  }, [props.open, props.address, web3]);

  useEffect(() => {
    if (fullyLoaded || loading || !props.open || page === null) return;
    setLoading(true);
    let fetch: {promise: Promise<any>, cancel: any};
    if (props.type === 'followers') fetch = fetchProfileFollowers(props.address, 0, account ? account : undefined);
    else fetch = fetchProfileFollowing(props.address, page, account ? account : undefined);

    fetch.promise.then(res => {
      if (res.status === 200) {

        const profiles: ProfileFollowingDisplay[] = res.data.results;
        setFullyLoaded(!res.data.next);
        setProfiles(existing => existing.concat(profiles));
      }
      else {

      }
      setLoading(false);
      }).catch(err => {
      console.log(err)
      setLoading(false);
    });

    return () => fetch.cancel();
  }, [page, currentAddress]);

  function handleScroll() {
    if (ref.current && !loading && !fullyLoaded) {
      const rect = ref.current.getBoundingClientRect();
      const elemTop = rect.top;
      if (elemTop < 0 && page) {
        setPage(page + 1);
      }
    }
  }

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
    props.onClose();
  }


  async function followUser(address: string) {
    if (!account) return;
    setProfiles(existing => existing.map(p => {if (p.address === address) p.following = true;return p}));
    try {
      const res: any = await insertFollow(account, address);
      if (props.address === account) props.onFollowChange(props.type, 1);
      if (res.jsonUrl) props.onPushToBlockchainRequired(res.jsonUrl);
    } catch (e: any) {
      setProfiles(existing => existing.map(p => {if (p.address === address) p.following = false;return p}));
      if (e.message.includes('registry')) {
        props.onPushToBlockchainRequired()
      }
    }
  }

  async function unfollowUser(address: string) {
    if (!account) return;
    setProfiles(existing => existing.map(p => {if (p.address === address) p.following = false;return p}));
    try {
      const res: any = await insertUnfollow(account, address);
      if (props.address === account) props.onFollowChange(props.type, -1);
      if (res.jsonUrl) props.onPushToBlockchainRequired(res.jsonUrl);
    } catch (e: any) {
      setProfiles(existing => existing.map(p => {if (p.address === address) p.following = true;return p}));
      if (e.message.includes('registry')) {
        props.onPushToBlockchainRequired();
      }
    }
  }

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={styles.FollowModal}>
        <div className={styles.Profiles} onScroll={handleScroll}>
          {
            profiles.length > 0 ?
            profiles.map((profile, index) =>
              index === profiles.length - 25 ?
              <div ref={ref} key={index} className={`${styles.Profile}`}>
                <div className={styles.ProfileDisplay}>
                  <div onClick={() => goToProfile(profile.address)} className={styles.ProfileImgMedium} style={{backgroundImage: `url(${profile.image ? formatUrl(profile.image) : DEFAULT_PROFILE_IMAGE})`}}/>
                  <span onClick={() => goToProfile(profile.address)} className={styles.NotificationText}><UserTag username={profile.name} address={profile.address}/></span>
                </div>
                {
                  profile.following ?
                  <button onClick={() => unfollowUser(profile.address)} className={`btn btn-secondary-no-fill`}>Following</button>
                    :
                  <button onClick={() => followUser(profile.address)} className={`btn btn-secondary`}>Follow</button>
                }
              </div>
                :
              <div key={index} className={`${styles.Profile}`}>
                <div className={styles.ProfileDisplay}>
                  <div onClick={() => goToProfile(profile.address)} className={styles.ProfileImgMedium} style={{backgroundImage: `url(${profile.image ? formatUrl(profile.image) : DEFAULT_PROFILE_IMAGE})`}}/>
                  <span onClick={() => goToProfile(profile.address)} className={styles.NotificationText}><UserTag username={profile.name} address={profile.address}/></span>
                </div>
                {
                  account &&
                  (profile.following ?
                    <button onClick={() => unfollowUser(profile.address)} className={`btn btn-secondary-no-fill`}>Following</button>
                    :
                    <button onClick={() => followUser(profile.address)} className={`btn btn-secondary`}>Follow</button>)
                }
              </div>
            ) :
            !loading && (props.type === 'followers' ?
              <p>No followers yet 🤷‍</p> :
              <p>{`You don't follow anyone yet 🤷`}</p>)
          }
          {
            loading && <div className={styles.Loading}><CircularProgress size={60}/></div>
          }
        </div>
      </div>
    </CustomModal>
  );
}

export default FollowModal;
