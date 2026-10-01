export default function Wordmark({ size = "md", onBack }: { size?: "lg" | "md" | "sm", onBack?: () => void }) {
  const title = size === "lg" ? "text-6xl sm:text-8xl md:text-9xl" : size === "md" ? "text-4xl sm:text-5xl" : "text-2xl";
  return (
    <div>
      <h1 className={`font-display font-black leading-none text-red ${title}`}>
        photobooth
      </h1>
      <p className={`${size === "lg" ? "mt-3 text-lg sm:text-xl" : "mt-1 text-sm"} font-medium text-ink/70`}>by knurlpot</p>
      {onBack && (
        <button 
          onClick={onBack}
          aria-label="Go back"
          className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-red text-red transition-all hover:-translate-y-1 hover:bg-red/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
