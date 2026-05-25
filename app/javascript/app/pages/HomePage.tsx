import * as React from "react";
import { Link } from "react-router-dom";
import type { Website } from "../models";
import PlusIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddWebsitePage from "./AddWebsitePage";

const HomePage: React.FC<{ websites: Website[] }> = ({ websites }) => {
  if (websites.length === 0) {
    return <AddWebsitePage welcome />;
  }

  return (
    <main className="home-page">
      <div className="container">
        <header className="home-header">
          <h1>Your Domains</h1>
          <p className="home-subtitle">
            {numerical(websites.length, "domain", "domains")} monitored
          </p>
        </header>
        <div className="domain-list">
          {websites.map((website) => {
            const hasReports = website.last24h_reports_count > 0;
            return (
              <Link
                to={`/domains/${website.id}/agg-reports`}
                className="domain"
                key={website.id}
              >
                <div className="domain-monogram">
                  {website.domain.charAt(0).toUpperCase()}
                </div>
                <div className="domain-info">
                  <div className="domain-host">{website.domain}</div>
                  <div
                    className={`reports-count${hasReports ? " has-reports" : ""}`}
                  >
                    <span>
                      {hasReports ? (
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
                      ) : (
                        "No new reports in the last 24 hours"
                      )}
                    </span>
                  </div>
                </div>
                <ChevronRightIcon className="domain-chevron" />
              </Link>
            );
          })}
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
