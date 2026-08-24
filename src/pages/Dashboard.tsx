// TODO: przebudować dashboard od zera, gdy będą gotowe statystyki meczów/drużyn, weather score i predykcje

import GoalsWeatherChart from "@/components/dashboard/GoalsWeatherChart";
import RecentMatches from "@/components/dashboard/RecentMatchesCard";
import SummaryCards from "@/components/dashboard/SummaryCards";

const Dashboard = () => {
  return (
    <>
      <SummaryCards />
      <GoalsWeatherChart />
      <RecentMatches />
    </>
  )
};

export default Dashboard;
