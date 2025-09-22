import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="flex flex-col gap-2 p-6">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Forgot Password
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 text-sm">
            Please enter your Employee ID and Email ID to raise a ticket to reset your password.
          </p>

          {/* Employee ID */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-sm">
              Employee ID
            </label>
            <Input
              type="text"
              placeholder="Enter your Employee ID"
              className="rounded-lg"
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-sm">
              Name
            </label>
            <Input
              type="text"
              placeholder="Enter your Name"
              className="rounded-lg"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-sm">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your Email"
              className="rounded-lg"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-sm">
              Department
            </label>
            <Input
              type="text"
              placeholder="Enter your Department"
              className="rounded-lg"
            />
          </div>

          {/* Designation */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium text-sm">
              Designation
            </label>
            <Input
              type="text"
              placeholder="Enter your Designation"
              className="rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <Button className="w-full rounded-lg py-6 text-lg">
            Raise Ticket
          </Button>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Go back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
