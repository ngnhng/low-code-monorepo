import { useEffect, useState } from "react";
import axios from "axios";

enum AuthState {
   LOADING,
   LOGGED_IN,
   LOGGED_OUT,
}

const useAuth = () => {
   const [state, setState] = useState(AuthState.LOADING);
   const authURL = "/api/auth/check";

   useEffect(() => {
      const checkState = async () => {
         const response = (await axios.get(authURL)).data;

         if (!response.result) {
            setState(AuthState.LOGGED_OUT);
            return;
         }

         setState(AuthState.LOGGED_IN);
      };

      checkState();
   });

   return [state];
};

export { AuthState };
export default useAuth;
