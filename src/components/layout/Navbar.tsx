import { Moon, Search, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";

import { Link, useLocation } from "react-router";

type NavLink = {
  label: string;
  to?: string;
  isActive: (pathname: string) => boolean;
};

const navLinks: NavLink[] = [
  { label: "Strona główna", to: "/", isActive: (pathname) => pathname === "/" },
  { label: "Drużyny", isActive: (pathname) => pathname.startsWith("/team") },
  {
    label: "Mecze",
    to: "/matches",
    isActive: (pathname) => pathname === "/matches",
  },
  { label: "Predykcje", isActive: () => false },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-background/70 backdrop-blur-md border-b">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center justify-between gap-4 px-6">
        <Link to="/">
          <div className="flex items-center gap-2">
            <div className="border bg-white dark:bg-primary p-1.5 rounded-sm">
              <img
                src="/ks_logo.png"
                alt="KorbaStats logo"
                className="h-8 w-8"
              />
            </div>
            <span className="text-lg font-semibold">KorbaStats</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = link.isActive(pathname);
            const className = buttonVariants({
              variant: active ? "secondary" : "ghost",
              size: "sm",
            });

            return link.to ? (
              <Link key={link.label} to={link.to} className={className}>
                {link.label}
              </Link>
            ) : (
              <span key={link.label} className={className}>
                {link.label}
              </span>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Wyszukaj drużynę..."
              className="w-48 pl-8 xl:w-64"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Przełącz motyw"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <Button>Zaloguj</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
