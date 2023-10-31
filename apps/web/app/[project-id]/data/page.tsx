"use client";

import { TableEditor } from "./TableEditor";

export default function Page() {
   const { projectId, tableId } = useParams();

   return (
      <>
         <TableEditor projectId tableId />
      </>
   );
}
