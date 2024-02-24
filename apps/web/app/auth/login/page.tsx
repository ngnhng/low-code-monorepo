'use client';

import { useUserAuth } from 'hooks/use-user-auth';
import { UserAuthForm } from './_components/user-auth-form';

export default function Page() {
  const { isLoading, user } = useUserAuth('sign-in');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-bold">Logging in...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <blockquote className="text-4xl text-black font-extrabold tracking-tight">
            <h2>Get your hands on YALC</h2>
            <h3>Yet another low-code platform</h3>
          </blockquote>
        </div>
        <div className="lg:p-16 xl:p-56">
          <h2 className="text-2xl font-bold mb-4">Sign in with:</h2>
          <UserAuthForm />
        </div>
      </div>
    );
  }
}
