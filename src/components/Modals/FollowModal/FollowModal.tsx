import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import styles from './FollowModal.module.scss';
import {formatUrl} from "../../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../../core/utils/constants";
import UserTag from "../../UserTag/UserTag";
import CustomModal from "../../CustomModal/CustomModal";
import {useDispatch, useSelector} from "react-redux";
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
import {connectToAPI} from "../../../core/web3";
import {setProfileJwt} from "../../../store/profile-reducer";

interface FollowModalProps {
  account: string,
  connectedAccount: string,
  type: 'following' | 'followers',
  open: boolean,
  onClose: () => any,
  onPushToBlockchainRequired: (jwt: string, jsonUrl?: string) => any,
  onFollowChange: (type: 'followers' | 'following', value: -1 | 1) => any;
}

const PROFILES_PER_LOAD: number = 50;

const FollowModal: FC<FollowModalProps> = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const jwt = useSelector((state: RootState) => state.profile.jwt);
  const web3 = useSelector((state: RootState) => state.web3.web3);
  const [profiles, setProfiles] = useState<ProfileFollowingDisplay[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [offset, setOffset] = useState(0);

  let ref: RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    const init = async () => {
      setInitialized(true);
      loadProfiles();
    }

    if(props.account && !initialized && props.open) init();
  }, [props.open, props.account, web3, jwt]);

  function handleScroll() {
    if (ref.current && !loading && !fullyLoaded) {
      const rect = ref.current.getBoundingClientRect();
      const elemTop = rect.top;
      if (elemTop < 0) {
        loadProfiles();
      }
    }
  }

  async function loadProfiles() {
    if (fullyLoaded) return;
    setLoading(true);
    let profiles: ProfileFollowingDisplay[] = [];
    try {
      if (props.type === 'followers') profiles = await fetchProfileFollowers(props.account, PROFILES_PER_LOAD, offset, props.connectedAccount);
      if (props.type === 'following') profiles = await fetchProfileFollowing(props.account, PROFILES_PER_LOAD, offset, props.connectedAccount);
      if (profiles.length < PROFILES_PER_LOAD) setFullyLoaded(true);
      setOffset(offset + profiles.length);
      setProfiles(existing => existing.concat(profiles));
      setLoading(false);
    }
    catch (e) {
      setLoading(false);
    }
  }

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
    props.onClose();
  }

  async function requestJWT() {
    const resJWT = await connectToAPI(props.account, web3);
    if (resJWT) {
      dispatch(setProfileJwt(resJWT));
      return resJWT;
    }
    else {
      throw 'Failed to connect';
    }
  }

  async function followUser(address: string) {
    setProfiles(existing => existing.map(p => {if (p.address === address) p.following = true;return p}));
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      try {
        const res: any = await insertFollow(props.account, address, headersJWT);
        props.onFollowChange(props.type, 1);
        if (res.jsonUrl) props.onPushToBlockchainRequired(headersJWT, res.jsonUrl);
      } catch (e: any) {
        setProfiles(existing => existing.map(p => {if (p.address === address) p.following = false;return p}));
        if (e.message.includes('registry')) {
          props.onPushToBlockchainRequired(headersJWT)
        }
      }
    }
    catch (e) {
      console.error(e);
      setProfiles(existing => existing.map(p => {if (p.address === address) p.following = false;return p}));
    }
  }

  async function unfollowUser(address: string) {
    setProfiles(existing => existing.map(p => {if (p.address === address) p.following = false;return p}));
    try {
      let headersJWT = jwt;
      if (!headersJWT) {
        headersJWT = await requestJWT();
      }
      try {
        const res: any = await insertUnfollow(props.account, address, headersJWT);
        props.onFollowChange(props.type, -1);
        if (res.jsonUrl) props.onPushToBlockchainRequired(headersJWT, res.jsonUrl);
      } catch (e: any) {
        setProfiles(existing => existing.map(p => {if (p.address === address) p.following = true;return p}));
        if (e.message.includes('registry')) {
          props.onPushToBlockchainRequired(headersJWT)
        }
      }
    }
    catch (e) {
      console.error(e);
      setProfiles(existing => existing.map(p => {if (p.address === address) p.following = true;return p}));
    }
  }

  return (
    <CustomModal open={props.open} onClose={props.onClose}>
      <div className={styles.FollowModal}>
        <div className={styles.Profiles} onScroll={handleScroll}>
          {
            profiles.length > 0 ?
            profiles.map((profile, index) =>
              index === profiles.length - PROFILES_PER_LOAD / 2 ?
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
                  profile.following ?
                    <button onClick={() => unfollowUser(profile.address)} className={`btn btn-secondary-no-fill`}>Following</button>
                    :
                    <button onClick={() => followUser(profile.address)} className={`btn btn-secondary`}>Follow</button>
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
