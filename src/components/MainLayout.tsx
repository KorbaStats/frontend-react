import { Outlet } from "react-router"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 items-center p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
