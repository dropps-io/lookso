import { connectToAPI } from '../web3';

import type Web3 from 'web3';

export async function handleAxiosNonGetError(
  address: string,
  currentPath: string,
  web3: Web3,
  e: any,
  promise: () => Promise<any>,
  recursive?: boolean
): Promise<any> {
  if (e.response && (e.response.status === 401 || e.response.status === 403) && !recursive) {
    await connectToAPI(address, currentPath, web3);
    return await promise();
  } else throw e;
}
