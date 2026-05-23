import { formatDistance } from "date-fns";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Api from "./api";
import type { AggReport } from "./models";
import Spinner from "./Spinner";
import Table from "./Table";
import type { Column } from "./Table";
import TimeRangeFilter from "./TimeRangeFilter";
import useFilters from "./useFilters";

const getId = (v: AggReport) => {
  return [
    v.params.disposition,
    v.params.violated_directive,
    v.params.blocked_uri,
    v.params.source_file,
  ].join("-");
};

const AggReports: React.FC<{}> = ({}) => {
  const [aggs, setAggs] = useState<AggReport[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    filters: { range },
    onFilterChange,
  } = useFilters(["range"]);

  const { id: websiteId } = useParams<{ id: string }>();

  async function loadAggs(websiteId: number | string, timeRange: string) {
    setLoading(true);
    const aggs = await Api.reports.aggs(websiteId, timeRange);
    setLoading(false);
    setAggs(aggs);
  }

  function viewAllLink(agg: AggReport) {
    const params = new URLSearchParams({});

    params.set("range", range);

    if (agg.params.disposition) {
      params.set("disposition", agg.params.disposition);
    } else {
      params.set("disposition", "none");
    }

    if (agg.params.violated_directive) {
      params.set("violated_directive", agg.params.violated_directive);
    } else {
      params.set("violated_directive", "none");
    }

    if (agg.params.blocked_uri) {
      params.set("blocked_uri", agg.params.blocked_uri);
    } else {
      params.set("blocked_uri", "none");
    }

    if (agg.params.source_file) {
      params.set("source_file", agg.params.source_file);
    } else {
      params.set("source_file", "none");
    }

    return `/#/domains/${websiteId}/all-reports?${params.toString()}`;
  }

  useEffect(() => {
    if (!websiteId) return;
    loadAggs(websiteId, range);
  }, [websiteId, range]);

  const cols: Column<AggReport>[] = [
    {
      key: "disposition",
      label: "Disp.",
      render: (v: AggReport) => (
        <div
          className={[
            "disposition-badge",
            v.params.disposition?.toLowerCase(),
          ].join(" ")}
        >
          {v.params.disposition?.substring(0, 1)}
        </div>
      ),
      width: "32px",
    },
    {
      key: "violated_directive",
      label: "Directive",
      render: (v: AggReport) => v.params.violated_directive,
      width: "96px",
    },
    {
      key: "blocked_uri",
      label: "Blocked URI",
      render: (v: AggReport) => v.params.blocked_uri,
    },
    {
      key: "count",
      label: "#",
      render: (v: AggReport) => v.count,
      align: "right",
      width: "32px",
    },
    {
      key: "last",
      label: "Last",
      render: (v: AggReport) => (
        <span className="secondary">
          {isoStringToTimeAgo(v.latest_reported_at)}
        </span>
      ),
      align: "right",
      width: "64px",
    },
    {
      key: "view_all_link",
      label: "",
      render: (v: AggReport) => <a href={viewAllLink(v)}>VIEW ALL →</a>,
      align: "right",
      width: "128px",
    },
  ];

  return (
    <div className="agg-reports">
      <div className="filters">
        <TimeRangeFilter
          value={range}
          onChange={(val) => onFilterChange("range", val)}
        />
      </div>
      <div className="data-view">
        {loading && <Spinner />}
        {aggs.length === 0 && !loading && (
          <div className="no-data">No new violations have been reported.</div>
        )}

        {aggs.length > 0 && (
          <div className="table-view">
            <Table data={aggs} columns={cols} getId={getId} />
          </div>
        )}
      </div>
    </div>
  );
};

function isoStringToTimeAgo(isoString: string) {
  const date = new Date(isoString);
  return formatDistance(date, new Date(), { addSuffix: true });
}

export default AggReports;
