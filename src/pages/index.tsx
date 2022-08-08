import type { NextPage } from 'next'
import Home from "./Home/Home";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {getWeb3Info} from "../core/web3";
import {setAccount, setBalance, setNetworkId, setWeb3} from "../store/web3-reducer";

const Index: NextPage = () => {
  const dispatch = useDispatch();

  useEffect( () => {
    initApp();
  });

  async function initApp() {
    const web3Info = await getWeb3Info();
    dispatch(setWeb3(web3Info.web3));
    dispatch(setAccount(web3Info.account));
    dispatch(setBalance(web3Info.balance));
    dispatch(setNetworkId(web3Info.networkId));
  }

  return (
      <Home></Home>
  )
}

export default Index
