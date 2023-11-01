"use client";

import { useParams, useRouter } from "next/navigation";
import { TableList } from "./components/TableList";

export default function Page() {
   const params = useParams();
   const router = useRouter();
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
