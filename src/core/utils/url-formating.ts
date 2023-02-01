import { ARWEAVE_GATEWAY, IPFS_GATEWAY } from '../../environment/constants';

export function formatUrl(url: string) {
  if (url && url.includes('ipfs://')) return url.replace('ipfs://', IPFS_GATEWAY);
  if (url && url.includes('ar://')) return url.replace('ar://', ARWEAVE_GATEWAY);
  else return url;
}
