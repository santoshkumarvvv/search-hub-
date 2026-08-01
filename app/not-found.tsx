import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <pre className="text-xs leading-none text-accent/40 md:text-sm">
{`████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
██████╗  █████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗██████╗ 
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝██╔══██╗
██████╔╝███████║██████╔╝██████╔╝███████║██║  ███╗█████╗  ██████╔╝
██╔══██╗██╔══██║██╔══██╗██╔══██╗██╔══██║██║   ██║██╔══╝  ██╔══██╗
██████╔╝██║  ██║██████╔╝██████╔╝██║  ██║╚██████╔╝███████╗██║  ██║
╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝`}
        </pre>
      </div>
      
      <h1 className="mb-4 text-2xl font-extrabold text-white">
        404 — Signal Lost
      </h1>
      
      <p className="mb-6 max-w-md text-muted">
        The requested data could not be located in our neural network. 
        The digital trail ends here.
      </p>
      
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-6 py-3 font-bold text-accent transition hover:border-accent hover:bg-accent hover:text-ink"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Return to Hub
      </Link>
      
      <p className="mt-8 text-xs text-muted/40">
        Powered by SearchHub · Built by SANTOSH KUMAR
      </p>
    </div>
  );
}
