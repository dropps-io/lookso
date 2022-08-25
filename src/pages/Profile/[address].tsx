import { useRouter } from 'next/router'
import Profile from "./Profile";
import {fetchProfileInfo} from "../../core/api";
import {InferGetServerSidePropsType} from "next";
import FourOhFour from "../404";
import Head from "next/head";
import React from "react";
import {ProfileInfo} from "../../models/profile";
import {formatUrl} from "../../core/utils/url-formating";

export const getServerSideProps = async ({ query }:any) => {
  try {
    const response = await fetchProfileInfo(query.address); // Fetch your data
    return {
      props: {
        name: response.name,
        links: response.links ,
        tags: response.tags,
        description: response.description,
        profileImage: response.profileImage,
        backgroundImage: response.backgroundImage},
    };
  } catch (e) {
    
  }
};

export default function ProfileAddress(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { address } = router.query;
  const profile = props as ProfileInfo;
  let slicedAddress = '';
  if (address) slicedAddress = (address as string).slice(2, 6).toUpperCase()
  const userTag = `@${profile.name ? profile.name : 'unnamed'}#${slicedAddress}`;

  if (address) return (<>
    <Head>
      <title>{userTag} | Lookso</title>
      <meta name='description' content={profile.description} />
      <meta property='og:title' content={`${userTag} | Lookso`} />
      <meta property='og:image' itemProp='image' content={formatUrl(profile.profileImage) || undefined} />
      <meta property='og:description' content={profile.description} />
      <meta property="og:type" content="website" />
    </Head>
    <Profile userTag={userTag} address={address as string} profileInfo={props}></Profile>;
  </>)
  else return <FourOhFour></FourOhFour>
}