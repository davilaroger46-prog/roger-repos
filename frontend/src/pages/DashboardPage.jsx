import CasesDashboard from "../components/CasesDashboard";
import { useCaseStore } from "../stores/caseStore";

export default function DashboardPage() {
  const { cases } = useCaseStore();
  return <CasesDashboard cases={cases} />;
}
