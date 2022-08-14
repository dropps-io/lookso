import { useRouter } from 'next/router'
import Profile from "./Profile";

export default function ProfileAddress() {
  const router = useRouter();
  const { address } = router.query;

  return <Profile address={address as string}></Profile>;
}