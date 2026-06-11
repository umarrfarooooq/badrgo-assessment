import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          BadrGo
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/users" className="hover:text-gray-300 transition-colors">
            Users
          </Link>
          <Link
            href="/wallets"
            className="hover:text-gray-300 transition-colors"
          >
            Wallets
          </Link>
          <Link
            href="/reports"
            className="hover:text-gray-300 transition-colors"
          >
            Reports
          </Link>
        </div>
      </div>
    </nav>
  );
}
