'use client';

import { redirect } from 'next/navigation';
import React, { useEffect } from 'react'

const Page = () => {

  useEffect(() => {
    // save access token and refresh token to local storage
    if (typeof window !== "undefined") {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');

      redirect('/auth/login');
    }

    return;
    
  }, [])

  return (
    <></>
  )
}

export default Page