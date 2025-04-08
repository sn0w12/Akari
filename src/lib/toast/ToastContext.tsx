"use client";

import React, { createContext, useContext, useReducer } from "react";
import { createPortal } from "react-dom";
import { ToastContainer } from "./ToastContainer";
import { useToastInitializer } from "../toastWrapper";

export type ToastType = "success" | "error" | "info" | "warning" | "default";
export type ToastPosition =
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";

export interface ToastOptions {
    position?: ToastPosition;
    theme?: "light" | "dark";
    autoClose?: number | false;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    pauseOnFocusLoss?: boolean;
    draggable?: boolean;
    delay?: number;
}

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    options: ToastOptions;
    createdAt: number;
}

export interface ToastContextType {
    toasts: Toast[];
    addToast: (
        message: string,
        type: ToastType,
        options?: ToastOptions,
    ) => string;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}

const defaultOptions: ToastOptions = {
    position: "top-right",
    theme: "dark",
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    delay: 0,
};

type Action =
    | { type: "ADD_TOAST"; payload: Toast }
    | { type: "REMOVE_TOAST"; payload: string }
    | { type: "CLEAR_ALL_TOASTS" };

function toastReducer(state: Toast[], action: Action): Toast[] {
    switch (action.type) {
        case "ADD_TOAST":
            return [...state, action.payload];
        case "REMOVE_TOAST":
            return state.filter((toast) => toast.id !== action.payload);
        case "CLEAR_ALL_TOASTS":
            return [];
        default:
            return state;
    }
}

export const ToastContext = createContext<ToastContextType | undefined>(
    undefined,
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [toasts, dispatch] = useReducer(toastReducer, []);

    const addToast = (
        message: string,
        type: ToastType = "default",
        options: ToastOptions = {},
    ): string => {
        const id = `toast-${Math.random().toString(36).substring(2, 9)}`;

        dispatch({
            type: "ADD_TOAST",
            payload: {
                id,
                message,
                type,
                options: { ...defaultOptions, ...options },
                createdAt: Date.now(),
            },
        });

        return id;
    };

    const removeToast = (id: string) => {
        dispatch({ type: "REMOVE_TOAST", payload: id });
    };

    const clearAllToasts = () => {
        dispatch({ type: "CLEAR_ALL_TOASTS" });
    };

    const value = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
    };

    return (
        <ToastContext.Provider value={value}>
            <ToastInitializer />
            {children}
            {typeof window !== "undefined" &&
                createPortal(<ToastContainer />, document.body)}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

function ToastInitializer() {
    useToastInitializer();
    return null;
}
