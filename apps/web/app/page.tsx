'use client';

import { useUserAuth } from 'hooks/use-user-auth';
import './styles.css';

import NavBar from 'components/navigation/nav-bar';
import { useRouter } from 'next/navigation';

import { Button } from '@repo/ui';

export default function Page() {
  const router = useRouter();
  const { isLoading, error, user } = useUserAuth('revalidate');
  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col px-52 gap-5 justify-center">
        <div className="flex flex-col">
          <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Get your hands on YALC
          </div>
          <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Yet another low-code platform
          </div>
        </div>
        <div className='w-[700px] break-words'>
          Our aim is to provide the users an easy application development
          process with us literally don't even know what we are doing.
        </div>
        <Button className='w-min'>Join us now!</Button>
      </div>
    </div>
  );
}
