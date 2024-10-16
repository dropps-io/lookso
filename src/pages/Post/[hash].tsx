import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import { type InferGetServerSidePropsType } from 'next';

import Post from './Post';
import FourOhFour from '../404';
import { fetchPost } from '../../core/api/api';
import { type FeedPost, initialFeedPost } from '../../components/PostBox/PostBox';
import { formatUrl } from '../../core/utils/url-formating';
import { getTextPostContent } from '../../components/PostBox/get-text-post-content';
import looksoLogo from '../../assets/images/lookso_logo.png';
import { WEBSITE_URL } from '../../environment/endpoints';

export const getServerSideProps = async ({ query }: any) => {
  try {
    const response = await fetchPost(query.hash); // Fetch your data
    return {
      props: { success: true, ...response },
    };
  } catch (e) {
    return {
      props: { success: false, ...initialFeedPost, date: '01/10/1999' },
    };
  }
};

export default function ProfileAddress(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { hash } = router.query;
  const post = props as FeedPost;
  const userTag = `@${post.author.name ? post.author.name : 'unnamed'}#${post.author.address.slice(
    2,
    6
  )}`;
  const description = getTextPostContent(post.display.text, post.display.params);

  if (hash && props.success)
    return (
      <>
        <Head>
          <title>
            {post.type === 'event' ? 'Event' : 'Post'} from {userTag} | LOOKSO
          </title>
          <meta
            name="twitter:card"
            content={post.display.image ? 'summary_large_image' : 'summary'}
          />
          <meta name="twitter:site" content="@lookso_io" />
          <meta
            name="twitter:title"
            content={`${post.type === 'event' ? 'Event' : 'Post'} from ${userTag} | LOOKSO`}
          />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:creator" content="@undeveloped" />
          <meta
            name="twitter:image"
            content={
              formatUrl(post.display.image) ||
              formatUrl(post.author.image) ||
              WEBSITE_URL + looksoLogo.src
            }
          />
          <meta
            name="twitter:image:alt"
            content={`${post.type === 'event' ? 'Event' : 'Post'} from ${userTag} Lookso`}
          />
          <meta name="description" content={description} />
          <meta
            property="og:title"
            content={`${post.type === 'event' ? 'Event' : 'Post'} from ${userTag} | Lookso`}
          />
          <meta
            property="og:image"
            content={
              formatUrl(post.display.image) ||
              formatUrl(post.author.image) ||
              WEBSITE_URL + looksoLogo.src
            }
          />
          <meta property="og:description" content={description} />
        </Head>
        <Post post={post} hash={hash as string}></Post>
      </>
    );
  else return <FourOhFour />;
}
