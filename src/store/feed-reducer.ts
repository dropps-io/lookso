import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {FeedPost} from "../components/PostBox/PostBox";

interface FeedStore{
    feed: FeedPost[],
    currentPost: string,
    currentOffset: number,
    currentType: 'Explore' | 'Feed' | 'Profile'
    currentFilter: 'all' | 'event' | 'post'
}

const initialState: FeedStore = {
    feed: [],
    currentPost: '',
    currentOffset: 0,
    currentType: 'Explore',
    currentFilter: 'all',
};

export const feedSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setStoredFeed: (state, action: PayloadAction<FeedPost[]>) => {
            state.feed = action.payload
        },
        addToStoredFeed: (state, action: PayloadAction<FeedPost[]>) => {
            state.feed = state.feed.concat(action.payload);
        },
        setCurrentPost: (state, action: PayloadAction<string>) => {
            state.currentPost = action.payload;
        },
        setCurrentOffset: (state, action: PayloadAction<number>) => {
            state.currentOffset = action.payload;
        },
        setCurrentFeedType: (state, action: PayloadAction<'Explore' | 'Feed' | 'Profile'>) => {
            console.log('set current type to ' + action.payload)
            state.currentType = action.payload;
        },
        setCurrentFeedFilter: (state, action: PayloadAction<'all' | 'event' | 'post'>) => {
            state.currentFilter = action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setCurrentPost, setStoredFeed, addToStoredFeed, setCurrentFeedType, setCurrentFeedFilter, setCurrentOffset } = feedSlice.actions;

export default feedSlice.reducer;
