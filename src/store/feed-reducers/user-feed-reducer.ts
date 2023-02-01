import { createFeedSlice } from './generate-feed-slice';

export const userFeedSlice = createFeedSlice('user-feed');

export default userFeedSlice.reducer;
