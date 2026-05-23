import { Link, NavLink, useLocation } from "react-router-dom";
import type { Website } from "./models";
import * as React from "react";
import Dropdown from "./components/Dropdown";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PlusIcon from "@mui/icons-material/Add";

const Sidebar: React.FC<{ websites: Website[] }> = ({ websites }) => {
  const pathname = useLocation().pathname;

  let domainId = null;
  if (pathname.startsWith("/domains/")) {
    domainId = pathname.split("/")[2];
  }

  return (
    <nav className="sidebar">
      <div className="top">
        <DomainPicker websites={websites} />
        <div className="add-website">
          <Link to="/add">
            <PlusIcon /> Add Website
          </Link>
        </div>
        {domainId && (
          <>
            <h2>Data</h2>
            <NavLink
              to={`/domains/${domainId}/agg-reports`}
              className={({ isActive }) =>
                isActive ? "navlink active" : "navlink"
              }
            >
              <InsertDriveFileOutlinedIcon />
              Aggregated Reports
            </NavLink>
            <NavLink
              to={`/domains/${domainId}/all-reports`}
              className={({ isActive }) =>
                isActive ? "navlink active" : "navlink"
              }
            >
              <InsertDriveFileOutlinedIcon />
              All Reports
            </NavLink>
          </>
        )}
      </div>

      <div className="bottom">
        {domainId && (
          <>
            <h2>Settings</h2>
            <NavLink
              to={`/domains/${domainId}/edit`}
              className={({ isActive }) =>
                isActive ? "navlink active" : "navlink"
              }
            >
              <CodeOutlinedIcon />
              Tracking URL
            </NavLink>
          </>
        )}
        <h2>Account</h2>
        <a href="/" className="navlink">
          <LogoutOutlinedIcon />
          Log out
        </a>
      </div>
    </nav>
  );
};

const DomainPicker: React.FC<{ websites: Website[] }> = ({ websites }) => {
  const pathname = useLocation().pathname;

  let domainId: null | number = null;
  if (pathname.startsWith("/domains/")) {
    const domainIdStr = pathname.split("/")[2];
    if (domainIdStr) {
      domainId = parseInt(domainIdStr, 10);
    }
  }

  const options = websites.map((w) => ({
    label: w.domain,
    id: w.id.toString(),
  }));

  return (
    <div className="domain-picker-dropdown">
      <Dropdown
        options={options}
        value={domainId?.toString() ?? ""}
        onSelect={(id) => {
          window.location.href = `/#/domains/${id}/agg-reports`;
        }}
        placeholder="Select a domain"
      />
    </div>
  );
};

export default Sidebar;
