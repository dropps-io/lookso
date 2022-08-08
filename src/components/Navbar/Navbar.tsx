import React, {FC, useState} from 'react';
import styles from './Navbar.module.scss';
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/images/logo.png";
import miniLogoLukso from "../../assets/images/logo_lukso_mini.png";
import {connectWeb3} from "../../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../../store/web3-reducer";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {shortenAddress} from "../../core/utils/address-formating";
import {NATIVE_TOKEN} from "../../environment/endpoints";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
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
        {
          account ?
            <li className={styles.Profile}>
              <img onClick={() => {setShowDropdown(!showDropdown)}} className={styles.ProfilePicSmall} src="https://preview.redd.it/v0caqchbtn741.jpg?auto=webp&s=c5d05662a039c031f50032e22a7c77dfcf1bfddc" alt=""/>
              <div className={`${styles.ProfileDropdown} ${!showDropdown ? styles.InactiveDropdown : ''}`}>
                <div className={styles.DropdownHeader}>
                  <img className={styles.ProfilePicMedium} src="https://preview.redd.it/v0caqchbtn741.jpg?auto=webp&s=c5d05662a039c031f50032e22a7c77dfcf1bfddc" alt=""/>
                  <div className={styles.ProfileContext}>
                    <strong>{ shortenAddress(account, 3) }</strong>
                    <span>L16 Testnet</span>
                  </div>
                </div>
                <p className={styles.ProfileName}>@samuel-v<span>#{account.slice(2, 6)}</span></p>
                <div className={styles.Balance}>
                  <img src={miniLogoLukso.src}/>
                  <span>{balance.slice(0, 7)} {NATIVE_TOKEN}</span>
                </div>
                <div className={styles.DropdownButtons}>
                  <div className={styles.TopButtons}>
                    <button className={styles.Btn + ' ' + styles.BtnSecondary}>Explorer</button>
                    <button className={styles.Btn + ' ' + styles.BtnSecondary}>UP.cloud</button>
                  </div>
                  <button className={styles.Btn + ' ' + styles.BtnMain}>Disconnect</button>
                </div>
              </div>
            </li>
            :
            <li className={styles.ImportantBtn} onClick={() => {connectToWeb3()}}>
              <a>Login</a>
            </li>
        }
      </ul>
    </div>
  );
}

export default Navbar;
