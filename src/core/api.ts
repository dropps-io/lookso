import {API_URL} from "../environment/endpoints";
import {FeedPost} from "../components/PostBox/PostBox";
import {LSPXXProfilePost} from "../models/profile-post";
import {Notification} from "../models/notification";
import {fileToBase64} from "./utils/file-to-base64";
import {ProfileDisplay, ProfileInfo} from "../models/profile";

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

  await fetch(API_URL + '/lookso/follow', {
    method: 'POST',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });
}

export async function insertUnfollow(followerAddress: string, followingAddress: string, jwt: string): Promise<void> {
  const content = {
    follower: followerAddress,
    following: followingAddress
  };

  await fetch(API_URL + '/lookso/unfollow', {
    method: 'DELETE',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });
}

export async function insertLike(address: string, postHash: string, jwt: string): Promise<void> {
  const content = {
    sender: address,
    postHash
  };

  await fetch(API_URL + '/lookso/like', {
    method: 'POST',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });
}

export async function deleteLike(address: string, postHash: string, jwt: string): Promise<void> {
  const content = {
    sender: address,
    postHash
  };

  await fetch(API_URL + '/lookso/like', {
    method: 'DELETE',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
  });
}

export async function fetchIsLikedPost(sender: string, postHash: string): Promise<boolean> {
  const likes = (await (await fetch(API_URL + '/lookso/post/' + postHash + '/likes?sender=' + sender)).json());
  return likes && likes.length > 0;
}


export async function fetchProfileInfo(address: string): Promise<ProfileInfo> {
  return await (await fetch(API_URL + '/lookso/profile/' + address + '/info')).json();
}

export async function fetchProfileFollowingCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/following/count')).json()).following;
}

export async function fetchProfileFollowersCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/followers/count')).json()).followers;
}

export async function fetchIsProfileFollower(followingAddress: string, followerAddress: string): Promise<boolean> {
  const followers = (await (await fetch(API_URL + '/lookso/profile/' + followingAddress + '/followers?followerAddress=' + followerAddress)).json()).followers;
  return followers && followers.length > 0;
}

export async function fetchProfileActivity(address: string, limit: number, offset: number, type?: 'event' | 'post'): Promise<FeedPost[]> {
  let url = API_URL + '/lookso/profile/' + address + '/activity?limit=' + limit + '&offset=' + offset;
  if (type) url +=  '&postType=' + type;
  return await (await fetch(url)).json();
}

export async function fetchProfileFeed(address: string, limit: number, offset: number, type?: 'event' | 'post'): Promise<FeedPost[]> {
  let url = API_URL + '/lookso/profile/' + address + '/feed?limit=' + limit + '&offset=' + offset;
  if (type) url +=  '&postType=' + type;
  return await (await fetch(url)).json();
}

export async function fetchAllFeed(limit: number, offset: number, type?: 'event' | 'post'): Promise<FeedPost[]> {
  let url = API_URL + '/lookso/feed?limit=' + limit + '&offset=' + offset;
  if (type) url +=  '&postType=' + type;
  return await (await fetch(url)).json();
}

export async function fetchPost(hash: string, viewOf?: string): Promise<FeedPost> {
  let url = API_URL + '/lookso/post/' + hash + '?viewOf=' + viewOf;
  return await (await fetch(url)).json();
}

export async function fetchPostComments(hash: string, limit: number, offset: number, viewOf?: string): Promise<FeedPost[]> {
  let url = API_URL + '/lookso/post/' + hash + '/comments?limit=' + limit + '&offset=' + offset + '&viewOf=' + viewOf;
  return await (await fetch(url)).json();
}

export async function fetchPostObjectWithAsset(post: LSPXXProfilePost, asset: File, jwt: string): Promise<LSPXXProfilePost> {
  const content = {
    lspXXProfilePost: post,
    fileType: asset.type,
    base64File: await fileToBase64(asset)
  };

  const res = await fetch(API_URL + '/lookso/post/request-object', {
    method: 'POST',
    body: JSON.stringify(content),
    headers: headersWithJWT(jwt)
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