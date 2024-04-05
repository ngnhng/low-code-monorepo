'use client';

import { useRouter } from 'next/navigation';

export default function Page({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  router.push(`/${params['projectId']}/edit`);
}
