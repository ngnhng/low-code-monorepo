import styles from './styles.module.css'; 

import Link from "next/link";
import Image from "next/image";

export default function Header({ headerTitle }: { headerTitle?: string }): JSX.Element {
    return (
        <div className={styles.header}>
            <Link href="/" className={styles.backButton}>
                <Image src="/back.png" width={48} height={48} alt="" />
            </Link>
            <div className="projectName">{headerTitle}</div>
        </div>
    );
}
