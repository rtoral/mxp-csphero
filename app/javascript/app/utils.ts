import { formatDistance } from "date-fns";
import type { Report } from "./models";

export function source(report: Report) {
  return [report.source_file, report.line_number, report.column_number]
    .filter((x) => !!x)
    .join(":");
}

export function formatDate(isoString: string) {
  const date = new Date(isoString);
  const str = formatDistance(date, new Date(), { addSuffix: true });
  if (str.includes("about")) {
    return str.replace("about ", "");
  }
  return str;
}

export function appConfig() {
  const bodyEl = document.querySelector("body");
  const dataAttr = bodyEl?.getAttribute("data-config");
  if (!dataAttr) {
    throw new Error("No config found");
  }
  return JSON.parse(dataAttr);
}
