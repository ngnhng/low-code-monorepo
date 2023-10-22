"use client"

import { useEffect } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';

import './style.css';

export default function Page() {
  const [accessToken, setAccessToken] = useLocalStorage('access_token');

  return accessToken ? (
    <>
      <>Decrypt this: {accessToken}</>
      <h1>profile page</h1>
    </>
  ) : (
    <>
      unauthenticated page
    </>
  )
}