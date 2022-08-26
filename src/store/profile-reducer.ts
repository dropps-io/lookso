import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {ProfileInfo} from "../models/profile";

interface ProfileWithJWT extends ProfileInfo{
    jwt: string
}

const initialState: ProfileWithJWT = {
    name: '',
    description: '',
    tags: [],
    links: [],
    profileImage: '',
    backgroundImage: '',
    jwt: ''
};

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfileInfo: (state, action: PayloadAction<ProfileInfo>) => {
            state.profileImage = action.payload.profileImage;
            state.backgroundImage = action.payload.backgroundImage;
            state.name = action.payload.name;
            state.tags = action.payload.tags;
            state.links = action.payload.links;
            state.description = action.payload.description;
        },
        setProfileJwt: (state, action: PayloadAction<string>) => {
            state.jwt = action.payload;
        },
    }
});

// Action creators are generated for each case reducer function
export const { setProfileInfo, setProfileJwt } = profileSlice.actions;

export default profileSlice.reducer;
