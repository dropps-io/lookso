import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {FeedPost} from "../components/PostBox/PostBox";

interface FeedStore{
    feed: FeedPost[],
    currentTopPosition: number,
    currentType: 'Explore' | 'Feed'
    currentFilter: 'all' | 'event' | 'post'
}

const initialState: FeedStore = {
    feed: [],
    currentTopPosition: 0,
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
        setCurrentFeedTopPosition: (state, action: PayloadAction<number>) => {
            state.currentTopPosition = action.payload;
        },
        setCurrentFeedType: (state, action: PayloadAction<'Explore' | 'Feed'>) => {
            state.currentType = action.payload;
        },
        setCurrentFeedFilter: (state, action: PayloadAction<'all' | 'event' | 'post'>) => {
            state.currentFilter = action.payload;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setCurrentFeedTopPosition, setStoredFeed, addToStoredFeed, setCurrentFeedType, setCurrentFeedFilter } = feedSlice.actions;

export default feedSlice.reducer;
