import {API_URL} from "../environment/endpoints";
import {FeedPost} from "../components/Post/Post";

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

export async function FetchIsLikedPost(sender: string, postHash: string) {
  const likes = (await (await fetch(API_URL + '/lookso/post/' + postHash + '/likes?sender=' + sender)).json()).followers;
  return likes && likes.length > 0;
}


export async function fetchProfileInfo(address: string) {
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