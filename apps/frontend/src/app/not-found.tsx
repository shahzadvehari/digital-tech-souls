import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#050B14]">
      <div className="text-blue-500 font-black text-9xl mb-4 tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
        404
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
      >
        <Home className="w-5 h-5" />
        Return Home
      </Link>
    </div>
  );
}
