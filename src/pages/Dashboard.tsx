// TODO: przebudować dashboard od zera, gdy będą gotowe statystyki meczów/drużyn, weather score i predykcje
import RecentMatches from "@/components/dashboard/RecentMatchesCard";
import SummaryCards from "@/components/dashboard/SummaryCards";

const Dashboard = () => {
  return (
    <>
      <SummaryCards />
      <RecentMatches />
    </>
  )
};

export default Dashboard;
