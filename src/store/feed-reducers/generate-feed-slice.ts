import {FeedPost} from "../../components/PostBox/PostBox";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface FeedStore{
  feed: FeedPost[],
  loading: boolean,
  hasMore: boolean,
  currentPost: string,
  currentPage: number | undefined,
  currentFilter: undefined | 'event' | 'post',
  profile?: string
}

export const initialState: FeedStore = {
  feed: [],
  loading: false,
  hasMore: true,
  currentPage: undefined,
  currentPost: '',
  currentFilter: undefined
};

export const createFeedSlice = (name: string) => createSlice({
  name, initialState, reducers: {
    setStoredFeed: (state, action: PayloadAction<FeedPost[]>) => {
      state.feed = action.payload;
    }, addToStoredFeed: (state, action: PayloadAction<FeedPost[]>) => {
      state.feed = state.feed.concat(action.payload); }
    , addToTopOfStoredFeed: (state, action: PayloadAction<FeedPost[]>) => {
      state.feed = action.payload.concat(state.feed);
    }, setCurrentPost: (state, action: PayloadAction<string>) => {
      state.currentPost = action.payload;
    }, setCurrentPage: (state, action: PayloadAction<number | undefined>) => {
      state.currentPage = action.payload;
    }, decrementPage: (state) => {
      const page = state.currentPage;
      if (page && page > 0) state.currentPage = page - 1;
    }, setCurrentFeedFilter: (state, action: PayloadAction<undefined | 'event' | 'post'>) => {
      state.currentFilter = action.payload;
    }, setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }, setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    }, setProfile: (state, action: PayloadAction<string>) => {
      state.profile = action.payload;
    }, resetFeedReducer: () => {
      return initialState;
    }
  }
});