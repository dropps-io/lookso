import React, { createRef, type FC, useState } from 'react';
import { useRouter } from 'next/router';

import styles from './SearchBar.module.scss';
import searchIcon from '../../assets/icons/search.svg';
import SearchResults from '../SearchResults/SearchResults';
import { type ProfileDisplay } from '../../models/profile';
import { Transaction } from '../../models/transaction';
import { searchInDatabase } from '../../core/api/api';

interface SearchBarProps {
  noBorder?: boolean;
  onClose?: () => any;
}

const SearchBar: FC<SearchBarProps> = props => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [profiles, setProfiles] = useState<ProfileDisplay[]>([]);
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  const ref = createRef<HTMLInputElement>();

  async function handleChange(e: any) {
    setSearchInput(e.target.value);
    await search(e.target.value);
  }

  function handleClose(profile?: ProfileDisplay) {
    if (profile != null) goToProfile(profile.address);
    setSearchInput('');
    if (ref.current != null) ref.current.value = '';
    if (props.onClose != null) props.onClose();
  }

  function goToProfile(account: string) {
    router.push('/Profile/' + account);
  }

  async function search(input: string) {
    setLoading(true);
    try {
      setProfiles([]);
      setTx(null);
      const searchResults = await searchInDatabase(input, 0);
      setProfiles(searchResults.search.profiles.results);
      if (searchResults.search.transactions.results.length > 0)
        setTx(searchResults.search.transactions.results[0]);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
  }

  return (
    <div className={`${styles.SearchBar} ${props.noBorder ? styles.NoBorder : ''}`}>
      {searchInput !== '' && (
        <div
          className={'backdrop'}
          onClick={() => {
            handleClose();
          }}
        ></div>
      )}
      <img src={searchIcon.src} alt="search" />
      <input
        ref={ref}
        onChange={handleChange}
        data-testid="SearchBar"
        placeholder="Search by address or username"
      ></input>
      <SearchResults
        loading={loading}
        transactions={tx ? [tx] : []}
        profiles={profiles}
        onClose={handleClose}
        open={!!searchInput}
      />
    </div>
  );
};

export default SearchBar;
