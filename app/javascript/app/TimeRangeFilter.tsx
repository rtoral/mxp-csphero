import * as React from "react";

// clock from mui icons
import ClockIcon from "@mui/icons-material/AccessTime";

import type { Range } from "./useFilters";
import Dropdown from "./components/Dropdown";

const TimeRangeFilter: React.FC<{
  value: Range;
  onChange: (value: Range) => void;
}> = ({ value, onChange }) => {
  const options = [
    { id: "24h", label: "Last 24 hours" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "Last 90 days" },
  ];

  return (
    <div className="filter">
      <label>
        <ClockIcon /> Time range
      </label>

      <Dropdown
        options={options}
        value={value}
        onSelect={(value) => onChange(value as Range)}
      />
    </div>
  );
};

export default TimeRangeFilter;
