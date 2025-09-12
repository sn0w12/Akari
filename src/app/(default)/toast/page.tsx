"use client";

import React, { useState } from "react";
import Toast from "@/lib/toastWrapper";

const ToastTestPage: React.FC = () => {
    const [activeToast, setActiveToast] = useState<Toast | null>(null);
    const [message, setMessage] = useState<string>(
        "This is a test toast message",
    );
    const [autoClose, setAutoClose] = useState<number>(5000);
    const [position, setPosition] = useState<string>("top-right");
    const [delay, setDelay] = useState<number>(0);

    const positions = [
        "top-right",
        "top-center",
        "top-left",
        "bottom-right",
        "bottom-center",
        "bottom-left",
    ];

    const showToast = (type: "success" | "error" | "info" | "warning") => {
        const options = {
            autoClose,
            position,
            delay,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
        };

        const newToast = new Toast(message, type, options);
        setActiveToast(newToast);
    };

    const closeToast = () => {
        if (activeToast) {
            activeToast.close();
            setActiveToast(null);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Toast Testing Page</h1>

            <div className="mb-6 p-4 border rounded">
                <h2 className="text-lg font-semibold mb-2">
                    Toast Configuration
                </h2>

                <div className="mb-4">
                    <label className="block mb-1">Message:</label>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1">
                        Auto Close (ms, 0 to disable):
                    </label>
                    <input
                        type="number"
                        value={autoClose}
                        onChange={(e) => setAutoClose(Number(e.target.value))}
                        className="p-2 border rounded"
                        min="0"
                        step="1000"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Position:</label>
                    <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="p-2 border rounded"
                    >
                        {positions.map((pos) => (
                            <option key={pos} value={pos}>
                                {pos}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-1">Delay (ms):</label>
                    <input
                        type="number"
                        value={delay}
                        onChange={(e) => setDelay(Number(e.target.value))}
                        className="p-2 border rounded"
                        min="0"
                        step="500"
                    />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Toast Types</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => showToast("success")}
                        className="px-4 py-2 bg-positive text-white rounded"
                    >
                        Success Toast
                    </button>
                    <button
                        onClick={() => showToast("error")}
                        className="px-4 py-2 bg-negative text-white rounded"
                    >
                        Error Toast
                    </button>
                    <button
                        onClick={() => showToast("info")}
                        className="px-4 py-2 bg-info text-white rounded"
                    >
                        Info Toast
                    </button>
                    <button
                        onClick={() => showToast("warning")}
                        className="px-4 py-2 bg-warning text-white rounded"
                    >
                        Warning Toast
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <button
                    onClick={closeToast}
                    disabled={!activeToast}
                    className={`px-4 py-2 rounded ${
                        activeToast
                            ? "bg-gray-500 text-primary hover:bg-gray-600"
                            : "bg-gray-200 text-muted-foreground cursor-not-allowed"
                    }`}
                >
                    Close Current Toast
                </button>
            </div>
        </div>
    );
};

export default ToastTestPage;
