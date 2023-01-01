import { useRouter } from 'next/router'
import Head from "next/head";
import React from "react";
import FourOhFour from "../404";
import looksoLogo from "../../assets/images/lookso_logo.png";
import {WEBSITE_URL} from "../../environment/endpoints";
import Transaction from "../../components/pages/Transaction/Transaction";

export default function TxHash() {
  const router = useRouter();
  const { hash } = router.query;

  if (hash) return (<>
      <Head>
        <title>Transaction {hash} | LOOKSO</title>
        <meta name="twitter:card" content={'summary'} />
        <meta name="twitter:site" content="@lookso_io" />
        <meta name="twitter:title" content={`Transaction ${hash} | LOOKSO`} />
        <meta name='twitter:description' content={'Transaction executed on the Lukso L16 network'} />
        <meta name='twitter:creator' content='@undeveloped' />
        <meta name='twitter:image' content={WEBSITE_URL + looksoLogo.src}/>
        <meta name='description' content={'Transaction executed on the Lukso L16 network'} />
        <meta property='og:title' content={`Transaction ${hash} | LOOKSO`} />
        <meta property='og:image' content={WEBSITE_URL + looksoLogo.src} />
        <meta property='og:description' content={'Transaction executed on the Lukso L16 network'} />
      </Head>
      <Transaction hash={hash as string}/>
    </>
  );
  else return <FourOhFour/>

}