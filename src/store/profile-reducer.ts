import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Profile} from "../models/profile";

const initialState: Profile = {
    name: '',
    description: '',
    tags: [],
    links: [],
    profileImage: '',
    backgroundImage: ''
};

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfileInfo: (state, action: PayloadAction<Profile>) => {
            state.profileImage = action.payload.profileImage;
            state.backgroundImage = action.payload.backgroundImage;
            state.name = action.payload.name;
            state.tags = action.payload.tags;
            state.links = action.payload.links;
            state.description = action.payload.description;
        },
    }
});

// Action creators are generated for each case reducer function
export const { setProfileInfo } = profileSlice.actions;

export default profileSlice.reducer;
