"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postAPI } from "@/app/api/apiHelper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"otp" | "reset">("otp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const verifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await postAPI("/auth/verify-otp", {
        employeeId,
        otp,
      });

      if (res.data?.status === "success") {
        setStep("reset");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await postAPI("/auth/reset-password", {
        employeeId,
        newPassword,
      });

      if (res.data?.status === "success") {
        setSuccess("Password reset successfully");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-center">
            {step === "otp" ? "Verify OTP" : "Reset Password"}
          </h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          {step === "otp" ? (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button onClick={verifyOtp} disabled={loading} className="py-6">
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={resetPassword} disabled={loading} className="py-6">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
