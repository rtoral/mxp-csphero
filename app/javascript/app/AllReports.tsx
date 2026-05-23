import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReportDetails from "./ReportDetails";
import Spinner from "./Spinner";
import Table from "./Table";
import TimeRangeFilter from "./TimeRangeFilter";
import Api from "./api";
import type { Report, ReportTimeAgg } from "./models";
import useFilters from "./useFilters";
import type { Disposition, Range } from "./useFilters";
import { formatDate, source } from "./utils";
import Dropdown from "./components/Dropdown";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReportChart from "./ReportChart";

const AllReports: React.FC<{}> = ({}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [timeSeries, setTimeSeries] = useState<ReportTimeAgg[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const listAbort = React.useRef<AbortController | null>(null);
  const tsAbort = React.useRef<AbortController | null>(null);

  const {
    filters: {
      range,
      disposition,
      violatedDirective,
      blockedUri,
      sourceFile,
      filterExtensions,
    },
    onFilterChange,
  } = useFilters([
    "range",
    "disposition",
    "violated_directive",
    "blocked_uri",
    "source_file",
    "filter_extensions",
  ]);

  const { id: websiteId } = useParams<{ id: string }>();

  async function loadReports(
    websiteId: number | string,
    range: Range,
    disposition: Disposition,
    violatedDirective: string | null,
    blockedUri: string | null,
    sourceFile: string | null,
    filterExtensions: "0" | "1",
    page: number
  ) {
    if (page === 0) {
      setReports([]);
    }
    setPage(page);
    setLoading(true);

    if (listAbort.current) {
      listAbort.current.abort();
    }

    listAbort.current = new AbortController();

    const res = await Api.reports.list(
      websiteId,
      {
        range,
        disposition,
        violatedDirective,
        blockedUri,
        sourceFile,
        filterExtensions,
      },
      page,
      listAbort.current.signal
    );
    setLoading(false);
    setHasMore(res.length >= 50);
    setReports([...(page === 0 ? [] : reports), ...res]);
  }

  async function loadTimeSeries(
    websiteId: number | string,
    range: Range,
    disposition: Disposition,
    violatedDirective: string | null,
    blockedUri: string | null,
    sourceFile: string | null,
    filterExtensions: "0" | "1"
  ) {
    // setLoading(true);

    if (tsAbort.current) {
      tsAbort.current.abort();
    }

    tsAbort.current = new AbortController();

    const res = await Api.reports.time_series(
      websiteId,
      {
        range,
        disposition,
        violatedDirective,
        blockedUri,
        sourceFile,
        filterExtensions,
      },
      tsAbort.current.signal
    );

    setTimeSeries(res);

    console.log(res);

    // setLoading(false);
  }

  const handleFiltersChange = async () => {
    if (!websiteId) return;
    loadReports(
      websiteId,
      range,
      disposition,
      violatedDirective ?? null,
      blockedUri ?? null,
      sourceFile ?? null,
      filterExtensions,
      0
    );

    loadTimeSeries(
      websiteId,
      range,
      disposition,
      violatedDirective ?? null,
      blockedUri ?? null,
      sourceFile ?? null,
      filterExtensions
    );
  };

  const handleNextPage: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (!websiteId) return;
    loadReports(
      websiteId,
      range,
      disposition,
      violatedDirective ?? null,
      blockedUri ?? null,
      sourceFile ?? null,
      filterExtensions,
      page + 1
    );
  };

  useEffect(() => {
    handleFiltersChange();
  }, [
    websiteId,
    range,
    disposition,
    violatedDirective,
    blockedUri,
    sourceFile,
    filterExtensions,
  ]);

  return (
    <div className="all-reports">
      <div className="filters">
        <TimeRangeFilter
          value={range}
          onChange={(val) => onFilterChange("range", val)}
        />

        <div className="filter">
          <label>Disposition</label>
          <Dropdown
            value={disposition}
            options={[
              { id: "enforce", label: "Enforce" },
              { id: "report", label: "Report" },
            ]}
            onSelect={(val) =>
              onFilterChange("disposition", val as Disposition)
            }
          />
        </div>

        <div className="filter">
          <label>Violated Directive</label>
          <input
            type="text"
            value={violatedDirective ?? ""}
            onChange={(e) =>
              onFilterChange("violated_directive", e.target.value)
            }
          />
        </div>

        <div className="filter">
          <label>Blocked URI</label>
          <textarea
            value={blockedUri ?? ""}
            onChange={(e) => onFilterChange("blocked_uri", e.target.value)}
          />
        </div>
        <div className="filter">
          <label>Source File</label>
          <textarea
            value={sourceFile ?? ""}
            onChange={(e) => onFilterChange("source_file", e.target.value)}
          />
        </div>
        <div className="filter checkbox">
          <label
            htmlFor="filter_extensions"
            title="Filter out reports from user browser extensions"
          >
            Filter out extensions
          </label>
          <input
            id="filter_extensions"
            type="checkbox"
            checked={filterExtensions === "1"}
            onChange={(e) =>
              onFilterChange("filter_extensions", e.target.checked ? "1" : "0")
            }
          />
        </div>
      </div>
      <div className="data-view">
        <ReportChart
          timeSeries={timeSeries}
          formatAs={range === "24h" ? "hour" : "day"}
        />

        {reports.length === 0 && !loading && (
          <div className="no-data">No new violations have been reported.</div>
        )}
        {(reports.length > 0 || (reports.length === 0 && loading)) && (
          <div className="table-view">
            <Table
              data={reports}
              getId={(v) => v.id.toString()}
              columns={[
                {
                  key: "created_at",
                  label: "Reported",
                  render: (v: Report) =>
                    v.created_at ? (
                      <span className="secondary">
                        {formatDate(v.created_at)}
                      </span>
                    ) : (
                      ""
                    ),

                  width: "148px",
                },
                // {
                //   key: "disposition",
                //   label: "Disposition",
                //   render: (v: Report) => (
                //     <div
                //       className={[
                //         "disposition-badge",
                //         v.disposition?.toLowerCase(),
                //       ].join(" ")}
                //     >
                //       {v.disposition}
                //     </div>
                //   ),
                //   width: "128px",
                // },
                {
                  key: "violated_directive",
                  label: "Directive",
                  render: (v: Report) => v.violated_directive,
                  width: "128px",
                },
                {
                  key: "blocked_uri",
                  label: "Blocked URI",
                  render: (v: Report) => v.blocked_uri,
                },
                {
                  key: "source",
                  label: "Source",
                  render: (v: Report) => source(v),
                },
                {
                  key: "view_all_link",
                  label: "",
                  render: (v: Report) => (
                    <a
                      href="#"
                      className="action-link details-link"
                      onClick={(e) => {
                        e.preventDefault();
                        if (expandedIds.includes(v.id.toString())) {
                          setExpandedIds(
                            expandedIds.filter((id) => id !== v.id.toString())
                          );
                        } else {
                          setExpandedIds([...expandedIds, v.id.toString()]);
                        }
                      }}
                    >
                      DETAILS
                      {expandedIds.includes(v.id.toString()) ? (
                        <ArrowUpwardIcon />
                      ) : (
                        <ArrowDownwardIcon />
                      )}
                    </a>
                  ),
                  align: "right",
                  width: "128px",
                },
              ]}
              renderExpanded={(v: Report) => {
                return <ReportDetails report={v} />;
              }}
              expandedIds={expandedIds}
            />

            {loading && <Spinner />}

            {!loading && reports.length > 0 && hasMore && (
              <div className="pagination">
                <button className="btn" onClick={handleNextPage}>
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
