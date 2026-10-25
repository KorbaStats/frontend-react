import { LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { getUserHandle } from "@/lib/userLabel";

import { Link, useLocation } from "react-router";
import Searchbar from "./Searchbar";

type NavLink = {
  label: string;
  to?: string;
  isActive: (pathname: string) => boolean;
};

const navLinks: NavLink[] = [
  { label: "Strona główna", to: "/", isActive: (pathname) => pathname === "/" },
  {
    label: "Mecze",
    to: "/matches",
    isActive: (pathname) => pathname.startsWith("/match"),
  },
  {
    label: "Ligi",
    to: "/leagues",
    isActive: (pathname) => pathname.startsWith("/league"),
  },
  {
    label: "Predykcje",
    to: "/predictions",
    isActive: (pathname) => pathname === "/predictions",
  },
];

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isRestoringSession, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card dark:bg-background/70 backdrop-blur-md border-b print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-450 items-center justify-between gap-4 px-4">
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Menu boczne"
            className="xl:hidden"
          >
            <Menu />
          </Button>

          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="border bg-card dark:bg-primary p-1.5 rounded-sm">
                <img
                  src="/ks_logo.png"
                  alt="KorbaStats logo"
                  className="h-7 w-7"
                />
              </div>
              <span className="text-lg font-semibold">KorbaStats</span>
            </div>
          </Link>
        </div>

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
          <Searchbar />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Przełącz motyw"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          {isRestoringSession ? (
            <div
              className="h-9 w-24 animate-pulse rounded-md bg-muted gap-2"
              aria-hidden
            />
          ) : user ? (
            <>
              <Link
                to="/profile"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <User />
                <span className="max-w-32 truncate">
                  {getUserHandle(user.email)}
                </span>
              </Link>
              <Button
                onClick={() => logout()}
                aria-label="wyloguj"
                size="sm"
                className="cursor-pointer"
              >
                <LogOut size={"icon"} />
                <span className="hidden xl:inline">Wyloguj</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button>Zaloguj</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
