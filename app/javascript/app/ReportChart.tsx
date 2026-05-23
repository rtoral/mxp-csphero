import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import Chart from "chart.js/auto";
import * as React from "react";
import type { ReportTimeAgg } from "./models";

const ReportChart: React.FC<{
  timeSeries: ReportTimeAgg[];
  formatAs?: "hour" | "day";
}> = ({ timeSeries, formatAs = "day" }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const chartRef = React.useRef<Chart | null>(null);
  const [visible, setVisible] = React.useState(true);

  const directives = timeSeries[0]?.violated_directives.map((vd) => vd.name);

  const labels = timeSeries.map((ts) => {
    const date = new Date(ts.t);
    if (formatAs === "hour") {
      return `${date.getHours()}:00`;
    } else if (formatAs === "day") {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } else {
      throw new Error("Invalid formatAs");
    }
  });

  const datasets: { label: string; data: number[] }[] = (directives ?? []).map(
    (d) => ({
      label: d,
      data: timeSeries.map((ts) => {
        const vd = ts.violated_directives.find((vd) => vd.name === d);
        return vd?.count ?? 0;
      }),
    })
  );

  const chartData = {
    labels,
    datasets,
  };

  React.useEffect(() => {
    if (canvasRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: chartData,
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [canvasRef]);

  React.useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data = chartData;
    chartRef.current.update();
  }, [chartData]);

  return (
    <div className={`report-chart ${visible ? "" : "hidden"}`}>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef}></canvas>
      </div>
      <button
        className="toggle-show-btn humble"
        onClick={() => setVisible(!visible)}
      >
        <BarChartOutlinedIcon />
        {visible ? "Hide chart" : "Show chart"}
      </button>
    </div>
  );
};

export default React.memo(ReportChart);
