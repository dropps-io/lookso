export interface Notification {
  address: string,
  sender: {
    address: string,
    name: string,
    image: string,
  },
  date: Date,
  type: 'like' | 'follow' | 'comment' | 'repost' | 'tag',
  viewed: boolean,
  postHash?: string
}