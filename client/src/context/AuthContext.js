// Module Importations
import { createContext, useContext, useReducer } from "react";
import ApiClient from '../ApiClient';

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const authReducer = (state, action) => {
    switch(action.type) {
        case "LOGIN_SUCCESS":
            return { ...state, isAuthenticated: true };
        case "SIGN_OUT_SUCCESS":
            return { ...state, isAuthenticated: false };
        default:
            return { ...state, isAuthenticated: false };
    }
}

const AuthProvider = ({ children }) => {
    let [state, dispatch] = useReducer(authReducer, { isAuthenticated: !!getLoginToken() });

    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchState.Provider value={dispatch}>
                { children }
            </AuthDispatchState.Provider>
        </AuthStateContext.Provider>
    )
}

const useAuthState = () => {
    let context = useContext(AuthStateContext);
    if(context === undefined) {
        throw new Error("useAuthState must be used within an AuthProvider");
    }

    return context;
}

const useAuthDispatch = () => {
    let context = useContext(AuthDispatchContext);
    if(context === undefined) {
        throw new Error("useAuthDispatch must be used within an AuthProvider");
    }

    return context;
}

const getLoginToken = () => {
    
}