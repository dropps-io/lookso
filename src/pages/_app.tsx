import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {Provider} from "react-redux";
import {store} from "../store/store";
import InitProvider from "./init";

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <Provider store={store}>
      <InitProvider>
        <Component {...pageProps} />
      </InitProvider>
    </Provider>
  )
}

export default MyApp
