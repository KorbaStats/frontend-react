import { Moon, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/hooks/useTheme"

const navLinks = ["Strona główna", "Mecze", "Statystyki", "Predykcje"]

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-background/70 backdrop-blur-md flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="flex items-center gap-2">
        <div className="border bg-white dark:bg-primary p-1.5 rounded-sm">
          <img src="/ks_logo.png" alt="KorbaStats logo" className="h-8 w-8" />
        </div>
        <span className="text-lg font-semibold">KorbaStats</span>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {navLinks.map((link, index) => (
          <Button
            key={link}
            // TODO: change this later to work with routing
            variant={index === 0 ? "secondary" : "ghost"}
            size="sm"
          >
            {link}
          </Button>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Wyszukaj drużynę..." className="w-48 pl-8 lg:w-64" />
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
    </header>
  )
}

export default Navbar
