import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Welcome Back
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-1/4 bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">Login As</span>
          <div className="h-px w-1/4 bg-gray-300"></div>
        </div>

        <div className="space-y-4">
          {/* Admin Button */}
          <button className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-xl py-3 hover:bg-gray-100 transition">
            <img
              src="https://img.icons8.com/office/40/conference-call.png"
              alt="Admin Icon"
              className="w-6 h-6"
            />
            <span className="text-gray-800 font-medium">Admin</span>
          </button>

          {/* Employee Button */}
          <Link href="/login" className="block">
            <button className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-xl py-3 hover:bg-gray-100 transition">
              <img
                src="https://img.icons8.com/office/40/conference-call.png"
                alt="Employee Icon"
                className="w-6 h-6"
              />
              <span className="text-gray-800 font-medium">Employee</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
