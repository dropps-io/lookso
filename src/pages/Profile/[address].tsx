import { useRouter } from 'next/router'
import Profile from "./Profile";

export default function ProfileAddress() {
  const router = useRouter();
  const { address } = router.query;
  console.log(address);

  return <Profile address={address as string}></Profile>;
}