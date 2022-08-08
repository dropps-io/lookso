import {API_URL} from "../environment/endpoints";

export async function fetchProfileInfo(address: string) {
  return await (await fetch(API_URL + '/lookso/profile/' + address + '/info')).json();
}

export async function fetchProfileFollowingCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/following/count')).json()).following;
}

export async function fetchProfileFollowersCount(address: string): Promise<number> {
  return (await (await fetch(API_URL + '/lookso/profile/' + address + '/followers/count')).json()).followers;
}