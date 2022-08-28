import React, {createRef, FC, useState} from 'react';
import styles from './SearchBar.module.scss';
import searchIcon from '../../assets/icons/search.svg';
import SearchResults from "../SearchResults/SearchResults";
import {ProfileDisplay} from "../../models/profile";
import {searchProfiles} from "../../core/api";

interface SearchBarProps {}

const  SearchBar: FC<SearchBarProps> = () => {
  const [searchInput, setSearchInput] = useState('');
  const [profiles, setProfiles] = useState<ProfileDisplay[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  const ref = createRef<HTMLInputElement>();

  function handleChange(e: any) {
    setSearchInput(e.target.value);
    fetchProfile(e.target.value);
  }

  function handleClose() {
    setSearchInput('');
    if (ref.current) ref.current.value = '';
  }

  async function fetchProfile(input: string) {
    setProfilesLoading(true);
    try {
      setProfiles([]);
      setProfiles(await searchProfiles(input, 5, 0));
      setProfilesLoading(false);
    } catch (e) {
      setProfilesLoading(false);
      console.error(e);
    }
  }

  return (
    <div className={styles.SearchBar}>
      {
        searchInput !== '' &&
        <div className={'backdrop'} onClick={handleClose}></div>
      }
      <img src={searchIcon.src} alt="search"/>
      <input ref={ref} onChange={handleChange} data-testid="SearchBar" placeholder='Search by address or username'></input>
      <SearchResults loading={profilesLoading} profiles={profiles} onClose={handleClose} open={!!searchInput}/>
    </div>
  );
}

export default SearchBar;
