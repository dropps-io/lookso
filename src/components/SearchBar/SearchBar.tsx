import React, {createRef, FC, useState} from 'react';
import styles from './SearchBar.module.scss';
import searchIcon from '../../assets/icons/search.svg';
import SearchResults from "../SearchResults/SearchResults";
import {ProfileDisplay} from "../../models/profile";
import {searchProfiles} from "../../core/api/api";
import {useRouter} from "next/router";

interface SearchBarProps {
  noBorder?: boolean,
  onClose?: () => any
}

const  SearchBar: FC<SearchBarProps> = (props) => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [profiles, setProfiles] = useState<ProfileDisplay[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  const ref = createRef<HTMLInputElement>();

  function handleChange(e: any) {
    setSearchInput(e.target.value);
    fetchProfiles(e.target.value);
  }

  function handleClose(profile?: ProfileDisplay) {
    if (profile) goToProfile(profile.address);
    setSearchInput('');
    if (ref.current) ref.current.value = '';
    if (props.onClose) props.onClose();
  }

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
  }

  async function fetchProfiles(input: string) {
    setProfilesLoading(true);
    try {
      setProfiles([]);
      setProfiles((await searchProfiles(input, 0)).results);
      setProfilesLoading(false);
    } catch (e) {
      setProfilesLoading(false);
      console.error(e);
    }
  }

  return (
    <div className={`${styles.SearchBar} ${props.noBorder ? styles.NoBorder : ''}`}>
      {
        searchInput !== '' &&
        <div className={'backdrop'} onClick={() => handleClose()}></div>
      }
      <img src={searchIcon.src} alt="search"/>
      <input ref={ref} onChange={handleChange} data-testid="SearchBar" placeholder='Search by address or username'></input>
      <SearchResults loading={profilesLoading} profiles={profiles} onClose={handleClose} open={!!searchInput}/>
    </div>
  );
}

export default SearchBar;
