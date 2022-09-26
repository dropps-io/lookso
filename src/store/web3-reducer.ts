import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Web3 from "web3";
import {RPC} from "../environment/endpoints";


export interface Web3State {
    web3: Web3,
    account?: string,
    networkId: number,
    balance: string,
    initialized: boolean
}

const initialState: Web3State = {
    web3: new Web3(RPC),
    account: undefined,
    networkId: 0,
    balance: '0',
    initialized: false
};

export const web3Slice = createSlice({
    name: 'web3',
    initialState,
    reducers: {
        setWeb3: (state, action: PayloadAction<Web3>) => {
            state.web3 = action.payload;
        },
        setAccount: (state, action: PayloadAction<string>) => {
            state.account = action.payload;
        },
        setNetworkId: (state, action: PayloadAction<number>) => {
            state.networkId = action.payload;
        },
        setBalance: (state, action: PayloadAction<string>) => {
            state.balance = action.payload;
        },
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.initialized = action.payload;
        },
        resetWeb3: () => {
            return initialState;
        }
    }
});

// Action creators are generated for each case reducer function
export const { setWeb3, setAccount, setBalance, setNetworkId, setInitialized, resetWeb3 } = web3Slice.actions;

export default web3Slice.reducer;
