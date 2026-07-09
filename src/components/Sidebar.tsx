import { leagues } from "@/data/leagues"
import { Trophy } from "lucide-react"

const Sidebar = () => {
  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto p-4 sm:flex">
      <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          Ligi
        </h3>
        <ul className="flex flex-col gap-1">
          {leagues.map((league) => (
            <li key={league.id}>
              <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/50 text-xs">
                  {league.flag}
                </span>
                <span>{league.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

    </aside>
  )
}

export default Sidebar