import React, { FC } from 'react';
import styles from './SearchBar.module.scss';
import searchIcon from '../../assets/icons/search.svg';

interface SearchBarProps {}

const  SearchBar: FC<SearchBarProps> = () => (
  <div className={styles.SearchBar}>
    <img src={searchIcon.src} alt="search"/>
    <input  data-testid="SearchBar" placeholder='Search by asset, collection, or profile'></input>
  </div>
);

export default SearchBar;
