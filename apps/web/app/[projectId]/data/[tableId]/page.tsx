"use client";

import { TableEditor } from "../_components/table-editor";

export default function Page({params} : {params: { 'projectId': string, 'tableId': string } }) {
   return (
      <>
         <TableEditor
            projectId={params["projectId"].toString()}
            tableId={params["tableId"].toString()}
         />
      </>
   );
}
