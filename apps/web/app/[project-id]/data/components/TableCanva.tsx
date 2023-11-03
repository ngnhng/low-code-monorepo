"use client";
import { TableRenderer } from "./TableRenderer";
import { TableCanvaProps, CanvaToolbar } from "./TableEditor";

export function TableCanva({ state, dispatch }: TableCanvaProps) {
   return (
      <div className="canva">
         <CanvaToolbar dispatch={dispatch} />
         <TableRenderer data={state.data} dispatch={dispatch} />
      </div>
   );
}
