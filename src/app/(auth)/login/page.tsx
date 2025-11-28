"use client";
import { setAuthToken, getAPI, postAPI } from "../../api/apiHelper";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { setStorage } from "../../../lib/storage/storege";
export default function LoginPage() {
  const [role, setRole] = useState<"employee" | "admin">("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const resp = await postAPI("/auth/login", { employeeId, password });
      const data = resp.data;
      // setAuthToken will store token into localStorage (as implemented)
      setAuthToken(data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken); // optional, already setAuthToken stored access
      localStorage.setItem("employeeId", data.employeeId);
      localStorage.setItem("role", data.role);

      // Redirect
      if (data.role === "ROLE_ADMIN") {
        setStorage(data.accessToken);
        router.push("/dashboard");
      } else {
        setStorage(data.accessToken);
        router.push("/employee");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="flex flex-col gap-6 p-8">
          {/* Toggle between Admin and Employee */}
          <div className="flex justify-center gap-4 mb-2">
            <Button
              type="button"
              variant={role === "employee" ? "default" : "outline"}
              className="w-1/2 rounded-lg"
              onClick={() => setRole("employee")}
            >
              Employee
            </Button>
            <Button
              type="button"
              variant={role === "admin" ? "default" : "outline"}
              className="w-1/2 rounded-lg"
              onClick={() => setRole("admin")}
            >
              Admin
            </Button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            {role === "employee" ? "Employee Login" : "Admin Login"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm">
                {role === "employee" ? "Employee ID" : "Admin ID"}
              </label>
              <Input
                type="text"
                placeholder={`Enter your ${
                  role === "employee" ? "Employee" : "Admin"
                } ID`}
                className="rounded-lg"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-medium text-sm">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your Password"
                className="rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-blue-600 text-sm hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
