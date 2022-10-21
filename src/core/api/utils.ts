import Web3 from "web3";
import {connectToAPI} from "../web3";

export async function handleAxiosNonGetError(address: string, web3: Web3, e: any, promise: () => Promise<any>, recursive?: boolean): Promise<any> {
  if (e.response && (e.response.status === 401 || e.response.status === 403) && !recursive) {
    await connectToAPI(address, web3);
    return await promise();
  }
  else throw e;
}