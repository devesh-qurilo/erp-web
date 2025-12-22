"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAPI } from "@/app/api/apiHelper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axios from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_MAIN}/auth/forgot-password`, {
        employeeId,
        email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });

      if (res.data?.status === "success") {
        setSuccess("OTP sent to your email");
        setTimeout(() => {
          router.push(
            `/verify-otp?employeeId=${encodeURIComponent(employeeId)}`
          );
        }, 1200);
      }
       if (res.data?.status === "error") {
         setMessage(res.data?.message);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP");
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-center">
            Forgot Password ?
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Please enter your Employee Id and Email Id to reset your password
          </p>

          {error && <p className="text-red-500 text-sm text-center">{message}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              placeholder="Enter Employee Id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Enter Email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button disabled={loading} className="py-6 text-lg">
              {loading ? "Sending OTP..." : "Reset Password"}
            </Button>
          </form>

          <Link
            href="/login"
            className="text-center text-sm text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
