import { IUser } from 'types/user';

export async function GET() {
  if (isNoAuth()) {
    //return new Response.json(getDefaultUser(), { status: 200 });
    return new Response(JSON.stringify(getDefaultUser()), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // fetch from server
  const base =
    process.env.LOW_CODE_MODE === 'development'
      ? 'http://localhost:80/user-api'
      : 'https://user.yalc.live';
  const response = await fetch(`${base}/api/v1/users`, {
    headers: {
      Authorization: `Bearer ${process.env.LOW_CODE_ACCESS_TOKEN}`,
    },
  });
}

const isNoAuth = () => {
  return process.env.LOW_CODE_NO_AUTH === 'true';
};

const getDefaultUser = (): IUser => {
  return {
    email: 'abc@gmail.com',
    display_name: 'John Doe',
    profile_image: 'https://via.placeholder.com/150',
  };
};
