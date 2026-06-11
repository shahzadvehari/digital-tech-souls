"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center z-50 relative bg-[#050B14]">
      <div className="w-24 h-24 mb-8 text-red-500 mx-auto">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        We apologize for the inconvenience. An unexpected error occurred while rendering this page.
      </p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
      >
        Try again
      </button>
    </div>
  );
}
