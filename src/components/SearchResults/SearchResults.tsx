import React, { FC } from 'react';
import styles from './SearchResults.module.scss';
import {ProfileDisplay} from "../../models/profile";
import {formatUrl} from "../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../UserTag/UserTag";
import {useRouter} from "next/router";
import CircularProgress from "@mui/material/CircularProgress";

interface SearchResultsProps {
  profiles: ProfileDisplay[],
  onClose: () => void,
  open: boolean,
  loading: boolean
}

const SearchResults: FC<SearchResultsProps> = (props) => {
  const router = useRouter();

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
    props.onClose();
  }

  return (
    <div className={`${styles.SearchResults} ${!props.open ? styles.Inactive : ''}`} data-testid="SearchResults">
      {
        props.loading ?
          <div className={styles.Centering}>
            <CircularProgress />
          </div>
          :
          props.profiles.length > 0 ?
            props.profiles.map(profile =>
              <div key={profile.address} onClick={() => goToProfile(profile.address)} className={styles.ProfileDisplay}>
                <div className={styles.ProfileImgMedium} style={{backgroundImage: `url(${profile.image ? formatUrl(profile.image) : DEFAULT_PROFILE_IMAGE})`}}/>
                <UserTag username={profile.name} address={profile.address}/>
              </div>
            )
            :
            <div className={styles.Centering}>
              <p>No profiles found 🤷</p>
            </div>
      }
    </div>
  );
}

export default SearchResults;
