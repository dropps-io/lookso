import React, { FC } from 'react';
import styles from './Navbar.module.scss';
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/images/logo.png";
import {connectWeb3} from "../../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
  const dispatch = useDispatch();
  const account: string = useSelector((state: RootState) => state.web3.account);
  const balance: string = useSelector((state: RootState) => state.web3.balance);

  async function connectToWeb3() {
    const web3Info = await connectWeb3();

    if (web3Info) {
      dispatch(setWeb3(web3Info.web3));
      dispatch(setAccount(web3Info.account));
      dispatch(setBalance(web3Info.balance));
      dispatch(setNetworkId(web3Info.networkId));
    }
  }

  return (
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
        <li className={styles.ImportantBtn} onClick={() => {connectToWeb3()}}><a>Login</a></li>
      </ul>
    </div>
  );
}

export default Navbar;
