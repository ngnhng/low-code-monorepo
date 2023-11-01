export function RowConfigMenu({ isOpen, onClose, dispatch }) {
   return (
      <div className={`row-config-menu ${isOpen ? "open" : ""}`}>
         <button onClick={() => dispatch({ type: "open-config-insert-row" })}>
            Insert Row
         </button>
      </div>
   );
}
