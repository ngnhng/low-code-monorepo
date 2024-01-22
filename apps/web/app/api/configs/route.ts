import { NextResponse } from 'next/server';
import { IAppConfig } from 'types/app';

export async function GET() {
  return NextResponse.json(getConfig(), { status: 200 });
}

function getConfig(): IAppConfig {
  return {
	mode: {
		is_dev: process.env.NODE_ENV === "development",
		is_prod: process.env.NODE_ENV === "production",
		no_auth: process.env.LOW_CODE_NO_AUTH === "true",
	},
    base_api_url: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    google_oauth: {
      client_id: process.env.LOW_CODE_GOOGLE_OAUTH_CLIENT_ID ?? "",
      callback: process.env.LOW_CODE_LOGIN_CALLBACK ?? "",
    },
    paths: {
      login: process.env.LOW_CODE_LOGIN_REQUEST ?? "",
    },
  }
}
