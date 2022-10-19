import {createFeedSlice} from "./generate-feed-slice";

export const profileFeedSlice = createFeedSlice('profile-feed');

export default profileFeedSlice.reducer;