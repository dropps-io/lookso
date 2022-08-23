import { useRouter } from 'next/router'
import Post from "./Post";

export default function ProfileAddress() {
  const router = useRouter();
  const { hash } = router.query;

  return <Post hash={hash as string}></Post>;
}