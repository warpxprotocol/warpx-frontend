import Link from 'next/link';

export default function LaunchAppButton() {
  return (
    <Link
      href="/pools/DOT%2FUSDT?baseId=1&quoteId=2"
      className="text-sm px-3 py-1.5 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-all duration-200"
    >
      Launch App
    </Link>
  );
}
