import "./NavBar.css";

import Link from "next/link";
import Image from "next/image";

import useLocalStorage from "../../hooks/useLocalStorage";

export default function NavBar() {
   // const [accessToken] = useLocalStorage("access_token", "");
   const accessToken: string = "";

   const renderNav = () => {
      if (accessToken !== "")
         return (
            <>
               <Link href="./projects">
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
            </>
         );

      return "";
   };

   const renderUser = () => {
      if (accessToken !== "") {
         return (
            <div className="user">
               <Image src="/g-logo.png" width={30} height={30} alt="" />
               <div className="userInfo">
                  <div className="welcome">Welcome back</div>
                  <div className="userName">{"Test userName"}</div>
               </div>
            </div>
         );
      }
      return (
         <Link href="./auth/login">
            <div className="navItem">Sign in</div>
         </Link>
      );
   };

   return (
      <div className="navBar">
         <div className="left">
            <Link href="./">
               <div className="home"></div>
            </Link>
            {renderNav()}
         </div>

         <div className="right">{renderUser()}</div>
      </div>
   );
}
