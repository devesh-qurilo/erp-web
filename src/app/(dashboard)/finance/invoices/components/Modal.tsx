"use client";
import { Button } from "@/components/ui/button";

export default function Modal({ open, title, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-8 overflow-auto">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
                <div className="flex justify-between items-center border-b px-5 py-3">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" onClick={onClose}>✕</Button>
                </div>

                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
