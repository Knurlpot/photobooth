import Link from "next/link";
import Wordmark from "@/components/Wordmark";

export default function Home() {
  return (
    <main className="safe-area-page flex min-h-dvh flex-col items-start justify-center gap-16 bg-cream px-6 sm:px-10 md:flex-row md:items-center md:justify-between md:px-16 lg:px-24">
      <div className="flex flex-col items-start">
        <Wordmark size="lg" />
      </div>

      <Link
        href="/booth"
        aria-label="Start"
        className="group flex items-center"
      >
        <span className="-mr-3 h-[5px] w-16 rounded-full bg-red transition-all group-hover:w-24 sm:w-20 md:w-32 md:group-hover:w-48" />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-red">
          <path d="M2 12h15m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </main>
  );
}
