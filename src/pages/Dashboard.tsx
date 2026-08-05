// TODO: rebuild the dashboard entirely when statistics for matches/teams, weather score and predictions are ready 

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
