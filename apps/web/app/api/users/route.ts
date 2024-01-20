import { NextResponse } from 'next/server';
import { IUser } from 'types/user';

export async function GET() {
  if (isNoAuth()) {
    return NextResponse.json(getDefaultUser(), { status: 200 });
  }

  return NextResponse.next();
}

const isNoAuth = () => {
  return process.env.LOW_CODE_NO_AUTH === 'true';
};

const getDefaultUser = (): IUser => {
  return {
    email: 'abc@gmail.com',
    display_name: 'John Doe',
  };
};
