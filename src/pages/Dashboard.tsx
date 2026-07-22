import GoalsWeatherChart from "@/components/GoalsWeatherChart";
import RecentMatches from "@/components/MatchesTable";
import SummaryCards from "@/components/SummaryCards";

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
