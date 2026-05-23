import * as React from "react";
import { formatDate, source } from "./utils";
import type { Report } from "./models";
import DataObjectIcon from "@mui/icons-material/DataObject";

const ReportDetails: React.FC<{ report: Report }> = ({ report }) => {
  const [view, setView] = React.useState<"parsed" | "raw">("parsed");

  return (
    <div className="report-details">
      <button
        className="humble report-view-switch"
        onClick={() => setView(view === "parsed" ? "raw" : "parsed")}
      >
        <DataObjectIcon />
        View {view === "parsed" ? "Raw" : "Parsed"}
      </button>

      {view === "parsed" && (
        <div className="report-details-body">
          <div className="report-details-ua">
            <h3>User Agent</h3>
            <div className="report-details-item">
              <div className="report-details-item-label">Browser</div>
              <div className="report-details-item-value">
                {report.user_agent.family} {report.user_agent.version}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">OS</div>
              <div className="report-details-item-value">
                {report.user_agent.os}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Device</div>
              <div className="report-details-item-value">
                {report.user_agent.device}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Device Brand</div>
              <div className="report-details-item-value">
                {report.user_agent.device_brand}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Device Model</div>
              <div className="report-details-item-value">
                {report.user_agent.device_model}
              </div>
            </div>
          </div>
          <div className="report-details-info">
            <h3>Report Details</h3>
            <div className="report-details-item">
              <div className="report-details-item-label">Reported At</div>
              <div className="report-details-item-value">
                {report.created_at ? formatDate(report.created_at) : ""}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Disposition</div>
              <div className="report-details-item-value">
                {report.disposition ? report.disposition.toUpperCase() : ""}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">
                Violated Directive
              </div>
              <div className="report-details-item-value">
                {report.violated_directive}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">
                Effective Directive
              </div>
              <div className="report-details-item-value">
                {report.effective_directive}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Blocked URI</div>
              <div className="report-details-item-value">
                {report.blocked_uri}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Source</div>
              <div className="report-details-item-value">{source(report)}</div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Document URI</div>
              <div className="report-details-item-value">
                {report.document_uri}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Referrer</div>
              <div className="report-details-item-value">{report.referrer}</div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Status Code</div>
              <div className="report-details-item-value">
                {report.status_code}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Script Sample</div>
              <div className="report-details-item-value">
                {report.script_sample}
              </div>
            </div>
            <div className="report-details-item">
              <div className="report-details-item-label">Original Policy</div>
              <div className="report-details-item-value">{report.referrer}</div>
            </div>
          </div>
        </div>
      )}

      {view === "raw" && (
        <div className="report-details-raw">
          {JSON.stringify(report.raw_body["csp-report"], null, 2)}
        </div>
      )}
    </div>
  );
};

export default ReportDetails;
