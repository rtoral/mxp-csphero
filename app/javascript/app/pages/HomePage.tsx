import * as React from "react";
import { Link } from "react-router-dom";
import type { Website } from "../models";
import PlusIcon from "@mui/icons-material/Add";
import AddWebsitePage from "./AddWebsitePage";

const HomePage: React.FC<{ websites: Website[] }> = ({ websites }) => {
  if (websites.length === 0) {
    return <AddWebsitePage welcome />;
  }

  return (
    <main className="home-page">
      <div className="container">
        <h1>Your Domains</h1>
        <div className="domain-list">
          {websites.map((website) => (
            <Link
              to={`/domains/${website.id}/agg-reports`}
              className="domain"
              key={website.id}
            >
              <div className="domain-host">{website.domain}</div>
              <div className="reports-count">
                {website.last24h_reports_count === 0 &&
                  "No new reports in the last 24 hours"}
                {website.last24h_reports_count > 0 && (
                  <>
                    <b>
                      {numerical(
                        website.last24h_reports_count,
                        "report",
                        "reports"
                      )}
                    </b>{" "}
                    in the last 24 hours
                  </>
                )}
              </div>
            </Link>
          ))}
          <Link to="/add" className="add-domain">
            <PlusIcon /> Add domain
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HomePage;

function numerical(x: number, singular: string, plural: string) {
  const lastDigit = x % 10;
  if (lastDigit === 1) {
    return `${x} ${singular}`;
  }
  return `${x} ${plural}`;
}
