import { EnvVariable, getEnv } from "../../../utils/getEnv";
import { cookies } from "next/headers";

export async function GET(request: Request) {
   const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"];
   const apiUrl = getEnv(EnvVariable.API_URL);

   const serverOAuthUrl = constructUrl(apiUrl, EnvVariable.LOGIN_REQUEST);
   const serverCallbackUrl = constructUrl(apiUrl, EnvVariable.LOGIN_CALLBACK);

   const successUrl = `${baseUrl}/auth/login?success=1`;
   const failureUrl = `${baseUrl}/auth/login?success=0`;

   // get query param ?success=1
   const incomingUrl = new URL(request.url ?? "");
   const params = incomingUrl.searchParams;

   const notLoggedInResponse = new Response(
      JSON.stringify({ isLoggedIn: false }),
      {
         headers: {
            "Content-Type": "application/json",
         },
      }
   );

   const loggedInResponse = new Response(JSON.stringify({ isLoggedIn: true }), {
      headers: {
         "Content-Type": "application/json",
      },
   });

   if (params.get("code")) {
      // handle code
      return await handleCode(
         incomingUrl,
         serverCallbackUrl,
         successUrl,
         failureUrl
      );
   } else if (params.get("isLoggedIn")) {
      const action = params.get("isLoggedIn");
      // check if user is logged in
      const result = await handleCheck(
         serverCallbackUrl,
         successUrl,
         failureUrl
      );

      const isLoggedIn = result.accessToken && result.refreshToken;

      if (action === "ask") {
         return isLoggedIn ? loggedInResponse : notLoggedInResponse;
      }

      return notLoggedInResponse;
   }

   // redirect caller to the server oauth url
   return Response.redirect(serverOAuthUrl, 302);
}

async function handleCode(
   url: URL,
   callbackUrl: string,
   successUrl: string,
   failureUrl: string
) {
   const callback = appendQueryToUrl(callbackUrl, url.search);

   // GET the callback url
   const response = await fetch(callback.toString(), {
      method: "GET",
   })
      .then((res) => res.json())
      .catch((err) => {
         return Response.redirect(failureUrl, 302);
      });

   const tokens = response.result.data;
   const { access_token: accessToken, refresh_token: refreshToken } = tokens;

   flushCookies();
   setCookies({
      access_token: accessToken,
      refresh_token: refreshToken,
   });

   // redirect to success
   return Response.redirect(successUrl, 302);
}

async function handleCheck(
   callbackUrl: string,
   successUrl: string,
   failureUrl: string
) {
   const { accessToken, refreshToken } = checkCookiesForTokens();

   const isLoggedIn = accessToken && refreshToken;

   if (isLoggedIn) {
      return { accessToken, refreshToken };
   }

   return { accessToken: null, refreshToken: null };
}

function constructUrl(base, path) {
   return `${base}${getEnv(path)}`;
}

function appendQueryToUrl(url, query) {
   const newUrl = new URL(url);
   const [_, queryParams] = query.split("?");
   newUrl.search = queryParams;

   return newUrl.toString();
}

function setCookies(tokens: { [key: string]: string }) {
   const oneHourMs = 1000 * 60 * 60;
   const oneWeekMs = oneHourMs * 24 * 7;
   Object.entries(tokens).forEach(([key, value]) => {
      if (key === "access_token") {
         cookies().set(key, value, { expires: Date.now() + oneHourMs });
      } else if (key === "refresh_token") {
         cookies().set(key, value, { expires: Date.now() + oneWeekMs });
      }
   });
}

function checkCookiesForTokens() {
   const accessToken = cookies().get("access_token");
   const refreshToken = cookies().get("refresh_token");

   if (!accessToken || !refreshToken) {
      return { accessToken: null, refreshToken: null };
   }

   return { accessToken, refreshToken };
}

function flushCookies() {
   cookies().delete("access_token");
   cookies().delete("refresh_token");
}
