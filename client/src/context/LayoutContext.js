// Module Importation
import { createContext, useContext, useReducer } from "react";

let LayoutStateContext = createContext();
let LayoutDispatchContext = createContext();

const layoutReducer = (state, action) => {
    switch(action.type) {
        case "TOGGLE_SIDEBAR":
            return { ...state, isSideBarOpen: !state.isSideBarOpen };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

const LayoutProvider = ({ children }) => {
    let [state, dispatch] = useReducer(layoutReducer, { isSideBarOpen: true });

    return (
        <LayoutStateContext.Provider value={state}>
            <LayoutDispatchContext.Provider value={dispatch}>
                { children }
            </LayoutDispatchContext.Provider>
        </LayoutStateContext.Provider>
    )
}

const useLayoutState = () => {
    let context = useContext(LayoutStateContext);
    if(context === undefined) {
        throw new Error("useLayoutState must be used within a LayoutProvider");
    }

    return context;
}

const useLayoutDispatch = () => {
    let context = useContext(LayoutDispatchContext);
    if(context === undefined) {
        throw new Error("useLayoutState must be used within a LayoutProvider");
    }

    return context;
}

const toggleSideBar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR"});
}

export { LayoutProvider, useLayoutState, useLayoutDispatch, toggleSideBar };