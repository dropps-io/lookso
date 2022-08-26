import Web3 from "web3";
import {fetchProfileAuthJwtToken, fetchProfileAuthNonce, fetchProfileInfo} from "./api";

declare const window: any;

export function listenChanges() {
  // window.ethereum.on('chainChanged', () => {
  //   getWeb3Info();
  // });
  // window.ethereum.on('accountsChanged', () => {
  //   getWeb3Info();
  // });
}

export async function getWeb3Info() {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.getAccounts();
  if (accounts.length === 0) throw 'No account connected';
  const balance = Web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
  // TODO verify how to fetch network id
  // const networkId = await web3.eth.net.getId();
  const networkId = 0;

  const profileInfo = await fetchProfileInfo(accounts[0]);

  return {
    web3,
    account: accounts[0],
    balance,
    networkId,
    profileInfo
  }
}

export async function connectWeb3() {
  const web3 = new Web3(window.ethereum);
  const accounts: string[] = await web3.eth.requestAccounts();
  if (accounts.length > 0) return await getWeb3Info();
}

export async function connectToAPI(address: string, web3: Web3) {
  const nonce = await fetchProfileAuthNonce(address);
  if (nonce) {
    const signed = await signMessage(address, nonce, web3);
    return (await fetchProfileAuthJwtToken(address, signed)).token;
  }
}

export async function signMessage(address: string, data: string, web3: Web3) {
  const res = await web3.eth.sign(data, address);
  return JSON.parse(JSON.stringify(res)).signature;
}