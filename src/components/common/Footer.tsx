export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center text-sm text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 dark:text-yellow-300">IMPORTANT NOTE</p>
          <p>There is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Artisan Canvas. Built with ❤️ at Cloudflare.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}