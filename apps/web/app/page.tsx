import "./styles.css";

import Link from "next/link";

export default function Page() {
   return (
      <>
         <div className="navBar">
            <div className="left">
               <Link href="./">
                  <div className="home"></div>
               </Link>
               <Link href="./">
                  <div className="navItem">Projects</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #1</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #2</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #3</div>
               </Link>
            </div>

            <div className="right">
               <Link href="./auth/login">
                  <div className="navItem">Sign in</div>
               </Link>
            </div>
         </div>
      </>
   );
}
