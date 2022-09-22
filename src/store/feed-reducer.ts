import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {FeedPost} from "../components/PostBox/PostBox";

interface FeedStore{
    feed: {
        Profile: FeedPost[],
        Explore: FeedPost[],
        Feed: FeedPost[],
    },
    currentPost: {
        Profile: string,
        Explore: string,
        Feed: string,
    },
    currentOffset: {
        Profile: number,
        Explore: number,
        Feed: number,
    },
    currentFilter: {
        Profile: 'all' | 'event' | 'post',
        Explore: 'all' | 'event' | 'post',
        Feed: 'all' | 'event' | 'post',
    }
}

const initialState: FeedStore = {
    feed: {
        Profile: [],
        Explore: [],
        Feed: [],
    },
    currentPost: {
        Profile: '',
        Explore: '',
        Feed: '',
    },
    currentOffset: {
        Profile: 0,
        Explore: 0,
        Feed: 0,
    },
    currentFilter: {
        Profile: 'all',
        Explore: 'all',
        Feed: 'all',
    },
};

export const feedSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setStoredFeed: (state, action: PayloadAction<{ type: 'Profile' | 'Explore' | 'Feed', feed: FeedPost[] }>) => {
            state.feed[action.payload.type] = action.payload.feed;
        },
        addToStoredFeed: (state, action: PayloadAction<{ type: 'Profile' | 'Explore' | 'Feed', feed: FeedPost[] }>) => {
            state.feed[action.payload.type] = state.feed[action.payload.type].concat(action.payload.feed);
        },
        setCurrentPost: (state, action: PayloadAction<{ type: 'Profile' | 'Explore' | 'Feed', postHash: string }>) => {
            state.currentPost[action.payload.type] = action.payload.postHash;
        },
        setCurrentOffset: (state, action: PayloadAction<{ type: 'Profile' | 'Explore' | 'Feed', offset: number }>) => {
            state.currentOffset[action.payload.type] = action.payload.offset;
        },
        setCurrentFeedFilter: (state, action: PayloadAction<{ type: 'Profile' | 'Explore' | 'Feed', filter: 'all' | 'event' | 'post'}>) => {
            state.currentFilter[action.payload.type] = action.payload.filter;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setCurrentPost, setStoredFeed, addToStoredFeed, setCurrentFeedFilter, setCurrentOffset } = feedSlice.actions;

export default feedSlice.reducer;
