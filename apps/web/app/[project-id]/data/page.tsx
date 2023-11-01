"use client";

import { useParams, useRouter } from "next/navigation";
import { TableList } from "./TableList";

export default function Page() {
   const params = useParams();
   const router = useRouter();
   console.log("params", params);
   // check if params contains 'project-id'
   if (params["project-id"]) {
      return (
         <>
            <TableList projectId={params["project-id"].toString()} />
         </>
      );
   } else {
      router.push("/projects");
   }
}
