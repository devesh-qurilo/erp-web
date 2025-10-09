"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Deal } from "@/types/deals";
import DealTags from "../../_components/DealTags";



export default function DealDetailPage() {
  const params = useParams();
  const dealId = params?.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) {
      setError("Deal ID not found");
      setLoading(false);
      return;
    }

    const fetchDeal = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("No access token found. Please log in.");
          return;
        }

        const res = await fetch(`/api/deals/get/${dealId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch deal: ${res.statusText}`);
        }

        const data: Deal = await res.json();
        setDeal(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load deal details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        Loading deal details...
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold text-red-600">
        {error || "Deal not found"}
        <Link href="/deals/get" className="ml-4 text-blue-600 hover:underline">
          Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/deals/get"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-2"
          >
            ← Back to Deals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
          <p className="text-sm text-gray-500">Deal ID: {deal.id}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            deal.dealStage.toUpperCase() === "WIN"
              ? "bg-green-100 text-green-800"
              : deal.dealStage.toUpperCase() === "LOST"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {deal.dealStage}
        </span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Main Deal Info */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Deal Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {deal.dealAgentMeta?.profileUrl ? (
                  <Image
                    src={deal.dealAgentMeta.profileUrl}
                    alt={deal.dealAgentMeta.name || "Agent"}
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">A</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{deal.dealAgentMeta?.name || deal.dealAgent}</p>
                  <p className="text-sm text-gray-500">Assigned Agent</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Value:</span>
                  <p className="text-2xl font-bold text-green-600">
                    ${deal.value.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="capitalize">{deal.dealCategory}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pipeline:</span>
                  <p>{deal.pipeline}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p>{new Date(deal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {/* {deal.description && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{deal.description}</p>
            </div>
          )} */}

          {/* {deal.notes && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )} */}
        </div>

        {/* Metadata & Timeline */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Deal Metadata</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Pipeline Stage:</span> {deal.pipeline}
              </p>
              <p>
                <span className="font-medium">Deal Category:</span> {deal.dealCategory}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(deal.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Files Section
          {deal.attachments && deal.attachments.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Files</h3>
              <ul className="space-y-2 text-sm">
                {deal.attachments.map((file) => (
                  <li key={file.id} className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {file.name}
                    </a>
                    <span className="text-gray-500 text-xs">({file.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Follow Up Section */}
          {/* {deal.followUps && deal.followUps.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Follow Ups</h3>
              <ul className="space-y-3 text-sm">
                {deal.followUps.map((followUp) => (
                  <li key={followUp.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">
                      {new Date(followUp.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">{followUp.description}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        followUp.status.toUpperCase() === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : followUp.status.toUpperCase() === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {followUp.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* People Section */}
          {/* {deal.people && deal.people.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">People</h3>
              <ul className="space-y-3 text-sm">
                {deal.people.map((person) => (
                  <li key={person.id} className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-gray-500">{person.role}</p>
                      {person.email && (
                        <a
                          href={`mailto:${person.email}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {person.email}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Comments Section */}
          {/* {deal.comments && deal.comments.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <ul className="space-y-4 text-sm">
                {deal.comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* Tags Section */}
          <DealTags dealId={dealId} />
        </div>
      </div>
    </div>
  );
}