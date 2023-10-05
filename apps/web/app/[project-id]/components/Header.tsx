import "./Header.css";

import Link from "next/link";
import Image from "next/image";

export default function Header({ headerTitle }: { headerTitle?: string }): JSX.Element {
    return (
        <div className="header">
            <Link href="/" className="backButton">
                <Image src="/back.png" width={48} height={48} alt="" />
            </Link>
            <div className="projectName">{headerTitle}</div>
        </div>
    );
}
