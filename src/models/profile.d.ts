export interface ProfileInfo {
  name: string,
  description: string,
  tags: string[],
  links: {url:string, title:string}[],
  profileImage: string,
  backgroundImage: string
}

export interface ProfileDisplay {
  address: string,
  name: string,
  image: string
}

export interface ProfileFollowingDisplay extends ProfileDisplay {
  following: boolean
}