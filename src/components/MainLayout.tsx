import { Outlet } from "react-router"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
