export interface ProfileInfo {
  name: string,
  description: string,
  tags: string[],
  links: {url:string, title:string}[],
  profileImage: string,
  backgroundImage: string
}