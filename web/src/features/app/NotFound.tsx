function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background  px-4">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="text-sm text-slate-400 mb-4">
        The page you’re looking for doesn’t exist.
      </p>
      <a
        href="/"
        className="text-sm font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
      >
        Go back home
      </a>
    </main>
  );
}
export default NotFound;