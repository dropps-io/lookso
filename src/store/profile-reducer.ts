import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type ProfileInfo } from '../models/profile';

const initialState: ProfileInfo = {
  name: '',
  description: '',
  tags: [],
  links: [],
  profileImage: '',
  backgroundImage: '',
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
    resetProfile: () => {
      return initialState;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setProfileInfo, resetProfile } = profileSlice.actions;

export default profileSlice.reducer;
