import { configureStore } from '@reduxjs/toolkit';
import web3Reducer from './web3-reducer';
import profileReducer from './profile-reducer';

export const store = configureStore({
    reducer: {
        web3: web3Reducer,
        profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
