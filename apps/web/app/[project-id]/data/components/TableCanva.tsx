"use client";
import { TableRenderer } from "./TableRenderer";
import { TableCanvaProps, CanvaToolbar } from "./TableEditor";

export function TableCanva({ state, dispatch }: TableCanvaProps) {
   return (
      <div className="canva">
         <div style={{ backgroundColor: "rgb(var(--background))" }}>
            <CanvaToolbar dispatch={dispatch} />
         </div>
         <TableRenderer data={state.data} dispatch={dispatch} />
      </div>
   );
}
