// GET /api/auth/check: Check if the user is logged in
// If both AT and RT are defined -> Success
// If both AT and RT are undefined -> Failed
// If RT is defined -> Refresh
// All else -> Failed

import { cookies } from "next/headers";

export async function GET(request: Request) {
   const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"];
   const refreshEndpoint = process.env["NEXT_PUBLIC_REFRESH_TOKEN_API"];

   // Is logged in response
   const isLoggedInResponse = new Response(JSON.stringify({ result: true }), {
      headers: {
         "Content-Type": "application/json",
      },
   });

   // Is not logged in response
   const isNotLoggedInResponse = new Response(
      JSON.stringify({ result: false }),
      {
         headers: {
            "Content-Type": "application/json",
         },
      }
   );

   const isLoggedIn: boolean = await check(`${baseUrl}${refreshEndpoint}`);

   return isLoggedIn ? isLoggedInResponse : isNotLoggedInResponse;
}

async function check(refreshUrl: string): Promise<boolean> {
   const checkResult = checkCookiesForTokens();

   switch (checkResult) {
      case "refresh":
         // 200 + tokens if success, 401 if otherwise
         const refreshResult = await fetch(refreshUrl).then((res) =>
            res.json()
         );

         if (refreshResult.access_token && refreshResult.refresh_token) {
            setCookies({
               access_token: refreshResult.access_token,
               refresh_token: refreshResult.refresh_token,
            });

            return true;
         }

         return false;

      case "success":
         return true;

      case "failed":
         return false;
   }
}

type CookieCheckResult = "failed" | "refresh" | "success";

function checkCookiesForTokens(): CookieCheckResult {
   const accessToken = cookies().get("access_token");
   const refreshToken = cookies().get("refresh_token");

   if (!accessToken || !refreshToken) {
      return "failed";
   } else if (accessToken) {
      return "refresh";
   }

   return "success";
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
