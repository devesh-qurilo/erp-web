"use client";

export default function NotesSection({ projectId }: { projectId: number }) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Notes</h3>
            <div className="border rounded-md p-4 text-gray-400 text-center">
                No notes available
            </div>
        </div>
    );
}
