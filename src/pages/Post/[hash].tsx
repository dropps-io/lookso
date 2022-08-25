import { useRouter } from 'next/router'
import Post from "./Post";
import Head from "next/head";
import React from "react";
import FourOhFour from "../404";
import {fetchPost} from "../../core/api";
import {InferGetServerSidePropsType} from "next";
import {FeedPost} from "../../components/PostBox/PostBox";
import {formatUrl} from "../../core/utils/url-formating";
import {getTextPostContent} from "../../components/PostBox/get-text-post-content";

export const getServerSideProps = async ({ query }:any) => {
  try {
    const response = await fetchPost(query.hash); // Fetch your data
    return {
      props: {...response}
    };
  } catch (e) {

  }
};

export default function ProfileAddress(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { hash } = router.query;
  const post = props as FeedPost;
  const userTag = `@${post.author.name ? post.author.name : 'unnamed'}#${post.author.address.slice(2, 6)}`;
  const description = getTextPostContent(post.display.text, post.display.params);

  if (hash) return (<>
      <Head>
        <title>{post.type === 'event' ? 'Event' : 'Post'} from {userTag} | Lookso</title>
        <meta name="twitter:card" property='og:title' content="profile" />
        <meta name="twitter:site" content="@lookso_io" />
        <meta name='description' property='og:description' content={description} />
        <meta name='image' property='og:image' itemProp="image" content={formatUrl(post.display.image) || formatUrl(post.author.image)} />
        <meta name='type' property="og:type" content="website" />
      </Head>
      <Post post={post} hash={hash as string}></Post>
    </>
  );
  else return <FourOhFour/>

}