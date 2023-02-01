import { configureStore } from '@reduxjs/toolkit';

import web3Reducer from './web3-reducer';
import profileReducer from './profile-reducer';
import userFeedReducer, { userFeedSlice } from './feed-reducers/user-feed-reducer';
import profileFeedReducer, { profileFeedSlice } from './feed-reducers/profile-feed-reducer';
import exploreFeedReducer, { exploreFeedSlice } from './feed-reducers/explore-feed-reducer';

export const store = configureStore({
  reducer: {
    web3: web3Reducer,
    profile: profileReducer,
    userFeed: userFeedReducer,
    exploreFeed: exploreFeedReducer,
    profileFeed: profileFeedReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export function getFeedActions(type: 'Explore' | 'Profile' | 'Feed') {
  switch (type) {
    case 'Explore':
      return exploreFeedSlice.actions;
    case 'Feed':
      return userFeedSlice.actions;
    case 'Profile':
      return profileFeedSlice.actions;
    default:
      return exploreFeedSlice.actions;
  }
}

export const getReduxFeedState = (store: RootState, type: 'Explore' | 'Profile' | 'Feed') => {
  switch (type) {
    case 'Explore':
      return store.exploreFeed;
    case 'Feed':
      return store.userFeed;
    case 'Profile':
      return store.profileFeed;
    default:
      return store.exploreFeed;
  }
};
