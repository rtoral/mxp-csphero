import * as React from "react";

import { useEffect } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import AggReports from "./AggReports";
import AllReports from "./AllReports";
import Sidebar from "./Sidebar";
import Spinner from "./Spinner";
import Api from "./api";
import type { User, Website } from "./models";
import AddWebsitePage from "./pages/AddWebsitePage";
import DomainEditPage from "./pages/DomainEditPage";
import DomainPage from "./pages/DomainPage";
import HomePage from "./pages/HomePage";

const App: React.FC = () => {
  const [me, setMe] = React.useState<User | null>(null);

  async function loadMe() {
    const res = await Api.users.me();
    setMe(res);
  }

  useEffect(() => {
    loadMe();
  }, []);

  // TODO
  const websites = me?.companies.reduce((acc: Website[], c) => {
    return [...acc, ...c.websites];
  }, [] as Website[]);

  if (me === null) {
    return (
      <div className="app">
        <main>
          <Spinner />
        </main>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Sidebar websites={websites ?? []} />
        <Routes>
          <Route path="/" element={<HomePage websites={websites ?? []} />} />
          <Route path="/add" element={<AddWebsitePage />} />
          <Route path="/domains/:id" element={<DomainPage />}>
            <Route index path="agg-reports" element={<AggReports />} />
            <Route path="all-reports" element={<AllReports />} />
          </Route>
          <Route path="/domains/:id/edit" element={<DomainEditPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
