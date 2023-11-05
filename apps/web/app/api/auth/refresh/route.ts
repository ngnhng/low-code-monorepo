// POST /api/auth/refresh: Refresh the access token
import { getEnv, EnvVariable } from "../../../../utils/getEnv";
export async function POST(request: Request) {
   const url = new URL(request.url);
   const body = await request.json();

   const serverApi = `${getEnv(EnvVariable.API_URL)}/api/auth/refresh`;

   const refreshToken = body.refresh_token;

   if (!refreshToken) {
      return new Response(undefined, {
         status: 401,
      });
   }

   const response = await fetch(serverApi)
      .then((res) => res.json())
      .catch((_) => undefined);

   if (!response || response.status != 200) {
      const tokens = response.result.data;

      return new Response(
         JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
         }),
         {
            status: 200,
            headers: {
               "Content-Type": "application/json",
            },
         }
      );
   }

   return new Response(undefined, {
      status: 401,
   });
}
