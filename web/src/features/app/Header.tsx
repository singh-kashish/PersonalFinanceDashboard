function Header() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-slate-800 bg-background/80 backdrop-blur">
      <div className="h-full flex items-center justify-between px-4">
        <div className="font-semibold">Flo</div>
        <div>User/avatar/etc</div>
      </div>
    </header>
  );
}
export default Header;