import React, { FC } from 'react';
import styles from './SearchResults.module.scss';
import {ProfileDisplay} from "../../models/profile";
import {formatUrl} from "../../core/utils/url-formating";
import {DEFAULT_PROFILE_IMAGE} from "../../core/utils/constants";
import UserTag from "../UserTag/UserTag";
import CircularProgress from "@mui/material/CircularProgress";
import {Transaction} from "../../models/transaction";
import transactionIcon from '../../assets/icons/transaction.svg';
import {shortenAddress} from "../../core/utils/address-formating";

interface SearchResultsProps {
  profiles: ProfileDisplay[],
  transactions: Transaction[]
  onClose: (profile?: ProfileDisplay) => void,
  open: boolean,
  loading: boolean
}

const SearchResults: FC<SearchResultsProps> = (props) => {

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
              <div key={profile.address} onClick={() => props.onClose(profile)} className={styles.ProfileDisplay}>
                <div className={styles.ProfileImgMedium} style={{backgroundImage: `url(${profile.image ? formatUrl(profile.image) : DEFAULT_PROFILE_IMAGE})`}}/>
                <UserTag username={profile.name} address={profile.address}/>
              </div>
            )
            :
            props.transactions.length > 0 ?
              props.transactions.map(transaction =>
                <div key={transaction.hash} className={styles.Transaction}>
                  <img src={transactionIcon.src} alt=""/>
                  <span title={transaction.hash}>{shortenAddress(transaction.hash, 15)}</span>
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
