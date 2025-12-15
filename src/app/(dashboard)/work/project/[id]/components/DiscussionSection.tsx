"use client";

export default function DiscussionSection({ projectId }: { projectId: number }) {
    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Discussion</h3>
            <div className="border rounded-md p-4 text-gray-400 text-center">
                Team discussion will appear here
            </div>
        </div>
    );
}
