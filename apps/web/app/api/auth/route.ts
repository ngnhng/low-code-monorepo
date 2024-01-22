import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const serverOAuthUrl = (apiUrl + '/auth/login').replaceAll('//', '/');

  const params = url.searchParams;

  if (
    params.get('accessToken') !== null &&
    params.get('refreshToken') !== null
  ) {
    // Set cookies
    const accessToken: string = params.get('accessToken')!;
    const refreshToken: string = params.get('refreshToken')!;
    flushCookies();
    setCookies({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // redirect to success
    return Response.redirect(`${url.origin}/auth/login`, 302);
  }

  // redirect caller to the server oauth url
  return Response.redirect(serverOAuthUrl, 302);
}

function setCookies(tokens: { [key: string]: string }) {
  const oneHourMs = 1000 * 60 * 60;
  const oneWeekMs = oneHourMs * 24 * 7;
  Object.entries(tokens).forEach(([key, value]) => {
    if (key === 'access_token') {
      cookies().set(key, value, { expires: Date.now() + oneHourMs });
    } else if (key === 'refresh_token') {
      cookies().set(key, value, { expires: Date.now() + oneWeekMs });
    }
  });
}

function checkCookiesForTokens() {
  const accessToken = cookies().get('access_token');
  const refreshToken = cookies().get('refresh_token');

  if (!accessToken || !refreshToken) {
    return { accessToken: null, refreshToken: null };
  }

  return { accessToken, refreshToken };
}

function flushCookies() {
  cookies().delete('access_token');
  cookies().delete('refresh_token');
}
