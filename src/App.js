import { useState } from "react";
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/Landing";
import "./App.css";

function App() {
  const [initialApplications, setInitialApplications] = useState([]);
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);

  return isDashboardVisible ? (
    <Dashboard
      initialApplications={initialApplications}
      onBack={() => setIsDashboardVisible(false)}
    />
  ) : (
    <Landing
      onContinue={(applications) => {
        setInitialApplications(applications);
        setIsDashboardVisible(true);
      }}
    />
  );
}

export default App;
