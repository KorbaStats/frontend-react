import RecentMatches from "@/components/MatchesTable";
import SummaryCards from "@/components/SummaryCards";
import { getColdestMatchWithWeather } from "@/services/matchesService";

function Dashboard() {

  console.log(getColdestMatchWithWeather());

  return (
    <>
      <SummaryCards />
      <RecentMatches />
    </>
  );
}

export default Dashboard;
