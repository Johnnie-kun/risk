import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Risk Dashboard</h1>
        <p className="text-lg mb-8">This is the homepage.</p>
        <Link
          href="/dashboard"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </main>
    </div>
  );
}