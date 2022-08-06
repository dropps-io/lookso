import React, { FC } from 'react';
import styles from './Navbar.module.scss';
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/images/logo.png";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => (
  <div className={styles.Navbar} data-testid="Navbar">
    <div className={styles.Logo}>
      <img src={logo.src} alt="Logo"/>
    </div>
    <div className={styles.Search}>
      <SearchBar></SearchBar>
    </div>
    <ul className={styles.Buttons}>
      <li><a href="">Discord</a></li>
      <li><a href="">F.A.Q</a></li>
      <li><a href="">Feed</a></li>
      <li className={styles.ImportantBtn}><a href="">Login</a></li>
    </ul>
  </div>
);

export default Navbar;
