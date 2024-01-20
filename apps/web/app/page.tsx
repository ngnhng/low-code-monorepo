'use client';

import { useUserAuth } from 'hooks/use-user-auth';
import './styles.css';

import NavBar from 'components/navigation/nav-bar';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const { isLoading, error, user } = useUserAuth('revalidate');
  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <NavBar />
    </>
  );
}
