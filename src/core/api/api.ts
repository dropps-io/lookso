import axios, { type AxiosPromise } from 'axios';

import { API_URL } from '../../environment/endpoints';
import { type FeedPost } from '../../components/PostBox/PostBox';
import { type LSPXXProfilePost } from '../../models/profile-post';
import { type Notification } from '../../models/notification';
import { type ProfileDisplay, type ProfileInfo } from '../../models/profile';
import { type PaginationResponse } from '../../models/pagination-response';
import { handleAxiosNonGetError } from './utils';
import { SearchResults } from '../../models/search';
import { AssetWithBalance } from '../../models/asset';

import type Web3 from 'web3';

axios.defaults.withCredentials = true;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export async function fetchProfileAuthSiwe(
  address: string,
  path: string
): Promise<{ message: string; issuedAt: string }> {
  return await (await fetch(API_URL + '/auth/' + address + '/siwe?path=' + path)).json();
}

export async function fetchProfileAuthJwtToken(
  address: string,
  signedMessage: string,
  issuedAt: string,
  path: string
): Promise<Response> {
  const content = {
    signedMessage,
    issuedAt,
    path,
  };
  return await axios.post(API_URL + '/auth/' + address + '/controller-signature', content, {
    headers,
  });
}

export async function insertFollow(
  follower: string,
  following: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<void> {
  const data = { follower, following };
  let res;

  try {
    res = await axios.post(API_URL + '/lookso/follow', data, { headers });
  } catch (e) {
    return await handleAxiosNonGetError(
      follower,
      currentPath,
      web3,
      e,
      async () => {
        await insertFollow(follower, following, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return res.data;
  else throw 'Request ended with status ' + res.status;
}

export async function insertUnfollow(
  follower: string,
  following: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<void> {
  const data = { follower, following };
  let res;

  try {
    res = await axios.delete(API_URL + '/lookso/unfollow', { headers, data });
  } catch (e) {
    return await handleAxiosNonGetError(
      follower,
      currentPath,
      web3,
      e,
      async () => {
        await insertUnfollow(follower, following, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return res.data;
  else throw 'Request ended with status ' + res.status;
}

export async function insertLike(
  sender: string,
  postHash: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<void> {
  const data = { sender, postHash };
  let res;

  try {
    res = await axios.post(API_URL + '/lookso/like', data, { headers });
  } catch (e: any) {
    return await handleAxiosNonGetError(
      sender,
      currentPath,
      web3,
      e,
      async () => {
        await insertLike(sender, postHash, currentPath, web3, true);
      },
      recursive
    );
  }
  if (res.status === 200) return res.data;
  else throw 'Request ended with status ' + res.status;
}

export async function fetchIsLikedPost(sender: string, postHash: string): Promise<boolean> {
  const query = API_URL + '/lookso/post/' + postHash + '/likes?sender=' + sender;
  const likes = await (await fetch(query)).json();
  return likes && likes.results && likes.results.length > 0;
}

export async function fetchProfileInfo(address: string): Promise<ProfileInfo> {
  const res = await fetch(API_URL + '/lookso/profile/' + address);
  if (res.ok) return await res.json();
  else throw await res.json();
}

export async function fetchAddressFromUserTag(username: string, digits: string): Promise<string> {
  const res = await fetch(API_URL + '/lookso/profile/' + username + '/' + digits);
  if (res.ok) return (await res.json()).address;
  else throw await res.json();
}

export async function fetchProfileFollowingCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/following/count')).json())
    .following;
}

export async function fetchProfileFollowersCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/followers/count')).json())
    .followers;
}

export async function fetchIsProfileFollower(
  followingAddress: string,
  followerAddress: string
): Promise<boolean> {
  const followers = await (
    await fetch(
      API_URL + '/lookso/profile/' + followingAddress + '/followers?follower=' + followerAddress
    )
  ).json();
  return followers.count > 0;
}

export function fetchProfileFollowers(
  address: string,
  page?: number,
  viewOf?: string
): {
  promise: AxiosPromise<Omit<PaginationResponse, 'results'> & { results: ProfileDisplay[] }>;
  cancel: any;
} {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/followers',
      params: { page, viewOf },
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}

export function fetchProfileFollowing(
  address: string,
  page?: number,
  viewOf?: string
): {
  promise: AxiosPromise<Omit<PaginationResponse, 'results'> & { results: ProfileDisplay[] }>;
  cancel: any;
} {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/following',
      params: { page, viewOf },
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}

export function fetchProfileActivity(
  address: string,
  page?: number,
  type?: 'event' | 'post',
  viewOf?: string
): { promise: AxiosPromise; cancel: any } {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/activity',
      params: { postType: type, page, viewOf },
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}

export function fetchProfileFeed(
  address: string,
  page?: number,
  type?: 'event' | 'post'
): { promise: AxiosPromise; cancel: any } {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/feed',
      params: { postType: type, page },
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}

export function fetchAllFeed(
  page?: number,
  type?: 'event' | 'post',
  viewOf?: string
): { promise: AxiosPromise; cancel: any } {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/feed',
      params: { viewOf, page, postType: type },
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}

export async function fetchPost(hash: string, viewOf?: string): Promise<FeedPost> {
  let query = API_URL + '/lookso/post/' + hash;
  if (viewOf) query += '?viewOf=' + viewOf;
  const res = await fetch(query);
  if (res.ok) return await res.json();
  else throw await res.json();
}

export async function fetchPostComments(
  hash: string,
  page?: number,
  viewOf?: string
): Promise<Omit<PaginationResponse, 'results'> & { results: FeedPost[] }> {
  return (
    await axios({
      method: 'GET',
      url: API_URL + '/lookso/post/' + hash + '/comments',
      params: { viewOf, page },
    })
  ).data;
}

export async function fetchPostObjectWithAsset(
  post: LSPXXProfilePost,
  asset: File,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<LSPXXProfilePost> {
  const headersLocal = {
    Accept: 'application/json',
  };

  const formData = new FormData();
  formData.append('lspXXProfilePost', JSON.stringify(post));
  formData.append('fileType', asset.type);
  formData.append('asset', asset);
  let res;

  try {
    res = await axios.post(API_URL + '/lookso/post/asset', formData, { headers: headersLocal });
  } catch (e) {
    return await handleAxiosNonGetError(
      post.author,
      currentPath,
      web3,
      e,
      async () => {
        return await fetchPostObjectWithAsset(post, asset, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return res.data.LSPXXProfilePost;
  else throw 'Request ended with status ' + res.status;
}

export async function uploadPostObject(
  post: LSPXXProfilePost,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<{ postHash: string; jsonUrl: string }> {
  const data = { lspXXProfilePost: post };
  let res;

  try {
    res = await axios.post(API_URL + '/lookso/post/upload', data, { headers });
  } catch (e) {
    return await handleAxiosNonGetError(
      post.author,
      currentPath,
      web3,
      e,
      async () => {
        return await uploadPostObject(post, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return res.data;
  else throw 'Request ended with status ' + res.status;
}

export async function fetchProfileNotificationsCount(address: string): Promise<number> {
  return (
    await (await fetch(API_URL + '/lookso/profile/' + address + '/notifications/count')).json()
  ).notifications;
}

export async function fetchProfileNotifications(
  address: string,
  page?: number
): Promise<Omit<PaginationResponse, 'results'> & { results: Notification[] }> {
  return (
    await axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/notifications',
      params: { page },
    })
  ).data;
}

export async function searchInDatabase(
  input: string,
  page?: number
): Promise<Omit<PaginationResponse, 'results | count'> & { search: SearchResults }> {
  return (
    await axios({
      method: 'GET',
      url: API_URL + '/lookso/search/' + input,
      params: { page },
    })
  ).data;
}

export async function setProfileNotificationsToViewed(
  address: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<void> {
  let res;

  try {
    res = await axios.put(
      API_URL + '/lookso/profile/' + address + '/notifications',
      {},
      { headers }
    );
  } catch (e) {
    return await handleAxiosNonGetError(
      address,
      currentPath,
      web3,
      e,
      async () => {
        await setProfileNotificationsToViewed(address, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return;
  else throw 'Request ended with status ' + res.status;
}

export async function requestNewRegistryJsonUrl(
  address: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<{ jsonUrl: string }> {
  let res;

  try {
    res = await axios.post(API_URL + '/lookso/profile/' + address + '/registry', {}, { headers });
  } catch (e) {
    return await handleAxiosNonGetError(
      address,
      currentPath,
      web3,
      e,
      async () => {
        return await requestNewRegistryJsonUrl(address, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return res.data;
  else throw 'Request ended with status ' + res.status;
}

export async function setNewRegistryPostedOnProfile(
  address: string,
  currentPath: string,
  web3: Web3,
  recursive?: boolean
): Promise<void> {
  let res;

  try {
    res = await axios.post(
      API_URL + '/lookso/profile/' + address + '/registry/uploaded',
      {},
      { headers }
    );
  } catch (e) {
    return await handleAxiosNonGetError(
      address,
      currentPath,
      web3,
      e,
      async () => {
        await setNewRegistryPostedOnProfile(address, currentPath, web3, true);
      },
      recursive
    );
  }

  if (res.status === 200) return;
  else throw 'Request ended with status ' + res.status;
}

export function fetchProfileAssets(address: string): {
  promise: AxiosPromise<AssetWithBalance[]>;
  cancel: any;
} {
  let cancel;
  return {
    promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/assets',
      cancelToken: new axios.CancelToken(c => (cancel = c)),
    }),
    cancel,
  };
}
