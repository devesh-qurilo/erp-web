"use client";

export default function FilesSection({ projectId }: { projectId: number }) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Files</h3>
            <div className="border rounded-md p-4 text-gray-400 text-center">
                No files uploaded
            </div>
        </div>
    );
}
