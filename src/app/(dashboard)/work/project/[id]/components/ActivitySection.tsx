"use client";

export default function ActivitySection({ projectId }: { projectId: number }) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Activity</h3>
            <div className="border rounded-md p-4 text-gray-400 text-center">
                Activity timeline will appear here
            </div>
        </div>
    );
}
