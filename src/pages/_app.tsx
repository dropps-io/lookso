import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {Provider} from "react-redux";
import {store} from "../store/store";
import InitProvider from "../components/init";
import Head from "next/head";
import fav16 from '../../public/favicon-16x16.png';
import fav32 from '../../public/favicon-32x32.png';
import appleTouch from '../../public/apple-touch-icon.png';
import React from "react";

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <Provider store={store}>
      <InitProvider>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href={appleTouch.src}/>
          <link rel="icon" type="image/png" sizes="32x32" href={fav32.src}/>
          <link rel="icon" type="image/png" sizes="16x16" href={fav16.src}/>
          <link rel="manifest" href="/site.webmanifest"/>
        </Head>
        <Component {...pageProps} />
      </InitProvider>
    </Provider>
  )
}

export default MyApp
