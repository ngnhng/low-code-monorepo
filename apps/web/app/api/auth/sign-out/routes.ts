
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_KEY } from "constants/cookies";

export async function POST() {

  cookies().delete(COOKIE_KEY.ACCESS_TOKEN);
  cookies().delete(COOKIE_KEY.REFRESH_TOKEN);

  // TODO: also blacklist the refresh token
  
  return NextResponse.json(
    {
      status: 200,
    }
  )
}
