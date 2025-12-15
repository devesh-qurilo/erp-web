"use client";

export default function InvoicesSection({ projectId }: { projectId: number }) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Invoices</h3>
            <div className="border rounded-md p-4 text-gray-400 text-center">
                No invoices linked to this project
            </div>
        </div>
    );
}
