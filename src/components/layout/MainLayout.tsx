import { Outlet } from "react-router"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex w-full max-w-360">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
