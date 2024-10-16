import { useRouter } from 'next/router';
import { type InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import React from 'react';

import Profile from './Profile';
import { fetchProfileInfo } from '../../core/api/api';
import FourOhFour from '../404';
import { type ProfileInfo } from '../../models/profile';
import { formatUrl } from '../../core/utils/url-formating';
import looksoLogo from '../../assets/images/lookso_logo.png';
import { WEBSITE_URL } from '../../environment/endpoints';

export const getServerSideProps = async ({ query }: any) => {
  try {
    const response = await fetchProfileInfo(query.address); // Fetch your data
    return {
      props: {
        success: true,
        name: response.name,
        links: response.links,
        tags: response.tags,
        description: response.description,
        profileImage: response.profileImage,
        backgroundImage: response.backgroundImage,
      },
    };
  } catch (e) {
    return {
      props: {
        success: false,
        name: '',
        links: [],
        tags: [],
        description: '',
        profileImage: '',
        backgroundImage: '',
      },
    };
  }
};

export default function ProfileAddress(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { address } = router.query;
  const profile = props as ProfileInfo;
  let slicedAddress = '';
  if (address) slicedAddress = (address as string).slice(2, 6).toUpperCase();
  const userTag = `@${profile.name ? profile.name : 'unnamed'}#${slicedAddress}`;

  if (address && props.success)
    return (
      <>
        <Head>
          <title>{userTag} | Lookso</title>
          <meta name="twitter:card" content={'summary'} />
          <meta name="twitter:site" content="@lookso_io" />
          <meta name="twitter:title" content={`${userTag} | LOOKSO`} />
          <meta name="twitter:description" content={profile.description} />
          <meta name="twitter:creator" content="@undeveloped" />
          <meta
            name="twitter:image"
            content={formatUrl(profile.profileImage) || WEBSITE_URL + looksoLogo.src}
          />
          <meta name="twitter:image:alt" content={`${userTag} Lookso`} />
          <meta name="description" content={profile.description} />
          <meta property="og:title" content={`${userTag} | Lookso`} />
          <meta
            property="og:image"
            itemProp="image"
            content={formatUrl(profile.profileImage) || WEBSITE_URL + looksoLogo.src}
          />
          <meta property="og:description" content={profile.description} />
        </Head>
        <Profile userTag={userTag} address={address as string} profileInfo={props}></Profile>
      </>
    );
  else return <FourOhFour></FourOhFour>;
}
