import {API_URL} from "../environment/endpoints";
import {FeedPost} from "../components/PostBox/PostBox";
import {LSPXXProfilePost} from "../models/profile-post";
import {Notification} from "../models/notification";
import {ProfileDisplay, ProfileInfo} from "../models/profile";
import axios from "axios";

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

const headersWithJWT = (jwt: string) => {
  return {
    ...headers,
    'Authorization': 'Bearer '+ jwt
  }
}

export async function fetchProfileAuthNonce(address:string): Promise<string> {
  return (await (await fetch(API_URL + '/auth/' + address + '/nonce')).json()).nonce;
}

export async function fetchProfileAuthJwtToken(address: string, signedNonce: string): Promise<{ token: string, address: string, validity: number }> {
  const content = {
    signedNonce
  };

  const res = await fetch(API_URL + '/auth/' + address + '/controller-signature', {
    method: 'POST',
    body: JSON.stringify(content),
    headers
  });

  return await res.json();
}

export async function insertFollow(followerAddress: string, followingAddress: string, jwt: string): Promise<void> {
  const content = {
    follower: followerAddress,
    following: followingAddress
  };

  const res = await fetch(API_URL + '/lookso/follow', {
    method: 'POST',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });

  if(!res.ok) throw await res.json();
  else return await res.json();
}

export async function insertUnfollow(followerAddress: string, followingAddress: string, jwt: string): Promise<void> {
  const content = {
    follower: followerAddress,
    following: followingAddress
  };

  const res = await fetch(API_URL + '/lookso/unfollow', {
    method: 'DELETE',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });

  if(!res.ok) throw await res.json();
  else return await res.json();
}

export async function insertLike(address: string, postHash: string, jwt: string): Promise<void> {
    const content = {
      sender: address,
      postHash
    };

    const res = await fetch(API_URL + '/lookso/like', {
      method: 'POST',
      body: JSON.stringify(content),
      headers: headersWithJWT(jwt)
    });

    if(!res.ok) throw await res.json();
    else return await res.json();
}

export async function fetchIsLikedPost(sender: string, postHash: string): Promise<boolean> {
  const likes = (await (await fetch(API_URL + '/lookso/post/' + postHash + '/likes?sender=' + sender)).json());
  return likes && likes.length > 0;
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
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/following/count')).json()).following;
}

export async function fetchProfileFollowersCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/followers/count')).json()).followers;
}

export async function fetchIsProfileFollower(followingAddress: string, followerAddress: string): Promise<boolean> {
  const followers = (await (await fetch(API_URL + '/lookso/profile/' + followingAddress + '/followers?followerAddress=' + followerAddress)).json());
  return followers && followers.length > 0;
}

export function fetchProfileFollowers(address: string, limit: number, offset: number, viewOf?: string): { promise: Promise<any>, cancel: any } {
  let cancel;
  return {promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/followers',
      params: { limit, offset, viewOf },
      cancelToken: new axios.CancelToken(c => cancel = c)
    }), cancel};
}

export function fetchProfileFollowing(address: string, limit: number, offset: number, viewOf?: string): { promise: Promise<any>, cancel: any } {
  let cancel;
  return {promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/following',
      params: { limit, offset, viewOf },
      cancelToken: new axios.CancelToken(c => cancel = c)
    }), cancel};
}

export function fetchProfileActivity(address: string, limit: number, offset: number, type?: 'event' | 'post', viewOf?: string): { promise: Promise<any>, cancel: any } {
  let cancel;
  return {promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/activity',
      params: { postType: type, limit, offset, viewOf },
      cancelToken: new axios.CancelToken(c => cancel = c)
    }), cancel};
}

export function fetchProfileFeed(address: string, limit: number, offset: number, type?: 'event' | 'post'): { promise: Promise<any>, cancel: any } {
  let cancel;
  return {promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/profile/' + address + '/feed',
      params: { postType: type, limit, offset },
      cancelToken: new axios.CancelToken(c => cancel = c)
    }), cancel};
}

export function fetchAllFeed(limit: number, offset: number, type?: 'event' | 'post', viewOf?: string): { promise: Promise<any>, cancel: any } {
  let cancel;
  return {promise: axios({
      method: 'GET',
      url: API_URL + '/lookso/feed',
      params: { viewOf, limit, offset, postType: type },
      cancelToken: new axios.CancelToken(c => cancel = c)
    }), cancel};
}

export async function fetchPost(hash: string, viewOf?: string): Promise<FeedPost> {
  let res = await fetch(API_URL + '/lookso/post/' + hash + '?viewOf=' + viewOf);
  if (res.ok) return await res.json();
  else throw await res.json();
}

export async function fetchPostComments(hash: string, limit: number, offset: number, viewOf?: string): Promise<FeedPost[]> {
  let url = API_URL + '/lookso/post/' + hash + '/comments?limit=' + limit + '&offset=' + offset + '&viewOf=' + viewOf;
  return await (await fetch(url)).json();
}

export async function fetchPostObjectWithAsset(post: LSPXXProfilePost, asset: File, jwt: string): Promise<LSPXXProfilePost> {
  const formData = new FormData();
  formData.append('lspXXProfilePost', JSON.stringify(post));
  formData.append('fileType', asset.type);
  formData.append('asset', asset);

  const headersLocal = {
    Accept: 'application/json',
    'Authorization': 'Bearer '+ jwt
  };

  const res = await fetch(API_URL + '/lookso/post/asset', {
    method: 'POST',
    body: formData,
    headers: headersLocal
  });

  return (await res.json()).LSPXXProfilePost;
}

export async function uploadPostObject(post: LSPXXProfilePost, signature: string, jwt: string): Promise<{postHash: string, jsonUrl: string}> {
  const content = {
    lspXXProfilePost: post,
    signature
  };

  const res = await fetch(API_URL + '/lookso/post/upload', {
    method: 'POST',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });
  return await res.json();
}

export async function fetchProfileNotificationsCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/notifications/count')).json()).notifications;
}

export async function fetchProfileNotifications(address: string, limit: number, offset: number): Promise<Notification[]> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/notifications?limit=' + limit + '&offset=' + offset)).json()) as Notification[];
}

export async function searchProfiles(input: string, limit: number, offset: number): Promise<ProfileDisplay[]> {
  return (await (await fetch(API_URL + '/lookso/search/' + input + '?limit=' + limit + '&offset=' + offset)).json()) as ProfileDisplay[];
}

export async function setProfileNotificationsToViewed(address: string, jwt: string): Promise<void> {
  await fetch(API_URL + '/lookso/profile/' + address + '/notifications',
    {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: headersWithJWT(jwt)
    });
}

export async function requestNewRegistryJsonUrl(address: string, jwt: string): Promise<{jsonUrl: string}> {
  const res = await fetch(API_URL + '/lookso/profile/' + address + '/registry', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: headersWithJWT(jwt)
  });
  if (res.ok) return await res.json();
  else throw await res.json();
}

export async function setNewRegistryPostedOnProfile(address: string, jwt: string): Promise<void> {
  const res = await fetch(API_URL + '/lookso/profile/' + address + '/registry/uploaded', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: headersWithJWT(jwt)
  });
  if (!res.ok) throw await res.json();
}
