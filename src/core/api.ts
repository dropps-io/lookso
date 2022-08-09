import {API_URL} from "../environment/endpoints";

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

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