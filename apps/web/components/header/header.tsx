import styles from './styles.module.css';

import Link from 'next/link';
import Image from 'next/image';

import { ArrowLeft } from 'lucide-react';

export default function Header({
  headerTitle,
}: {
  headerTitle?: string;
}): JSX.Element {
  return (
    <div className="w-full h-16 flex px-[50px] gap-5 items-center border-b-2 border-b-gray-100">
      <Link href="/projects" className="rounded-full hover:bg-slate-100 p-1">
        <ArrowLeft />
      </Link>
      <div className="font-semibold text-sm">{headerTitle}</div>
    </div>
  );
}
