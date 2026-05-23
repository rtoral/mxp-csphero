import type { AggReport, Report, ReportTimeAgg, User, Website } from "./models";

export default {
  reports: {
    list: (
      wsId: number | string,
      filters: {
        range: string;
        disposition: string | null;
        violatedDirective: string | null;
        blockedUri: string | null;
        sourceFile: string | null;
        filterExtensions: "0" | "1";
      },
      page = 0,
      // abort
      signal?: AbortSignal
    ): Promise<Report[]> => {
      const pars: any = {
        website_id: wsId.toString(),
        page: page.toString(),
        range: filters.range,
      };

      if (filters.disposition) {
        pars["disposition"] = filters.disposition;
      }

      if (filters.violatedDirective) {
        pars["violated_directive"] = filters.violatedDirective;
      }

      if (filters.blockedUri) {
        pars["blocked_uri"] = filters.blockedUri;
      }

      if (filters.sourceFile) {
        pars["source_file"] =
          filters.sourceFile === "none" ? "__NONE__" : filters.sourceFile;
      }

      if (filters.filterExtensions === "1") {
        pars["filter_extensions"] = "1";
      }

      return api("get", "/reports", pars, signal);
    },
    time_series: (
      wsId: number | string,
      filters: {
        range: string;
        disposition: string | null;
        violatedDirective: string | null;
        blockedUri: string | null;
        sourceFile: string | null;
        filterExtensions: "0" | "1";
      },
      // abort
      signal?: AbortSignal
    ): Promise<ReportTimeAgg[]> => {
      const pars: any = {
        website_id: wsId.toString(),
        range: filters.range,
      };

      if (filters.disposition) {
        pars["disposition"] = filters.disposition;
      }

      if (filters.violatedDirective) {
        pars["violated_directive"] = filters.violatedDirective;
      }

      if (filters.blockedUri) {
        pars["blocked_uri"] = filters.blockedUri;
      }

      if (filters.sourceFile) {
        pars["source_file"] =
          filters.sourceFile === "none" ? "__NONE__" : filters.sourceFile;
      }

      if (filters.filterExtensions === "1") {
        pars["filter_extensions"] = "1";
      }

      return api("get", "/reports/time_series", pars, signal);
    },
    aggs: (wsId: number | string, timeRange: string): Promise<AggReport[]> =>
      api("get", `/reports/aggs?website_id=${wsId}&range=${timeRange}`),
  },
  users: {
    me: (): Promise<User> => api("get", "/users/me"),
  },
  websites: {
    list: (): Promise<Website[]> => api("get", "/websites"),
    get: (id: number | string): Promise<Website> =>
      api("get", `/websites/${id}`),
    create: (domain: string): Promise<Website | { errors: string[] }> =>
      api("post", "/websites", { domain }),
  },
};

type FetchParams = Parameters<typeof fetch>[1];

async function api(
  method: string,
  url: string,
  data?: { [k: string]: string },
  signal?: AbortSignal
) {
  const attrs: FetchParams = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    if (method === "get") {
      url = `${url}?${toQuery(data)}`;
    } else {
      attrs.body = JSON.stringify(data);
    }
  }

  // csrf
  const meta = document.querySelectorAll<HTMLMetaElement>(
    "[name='csrf-token']"
  )[0];
  if (meta) {
    // @ts-ignore
    attrs.headers["X-CSRF-Token"] = meta.content;
  }

  if (signal) {
    attrs.signal = signal;
  }

  return fetch(`/api${url}`, attrs).then((x) => x.json());
}

function toQuery(data: { [k: string]: string }) {
  const esc = window.encodeURIComponent;
  return (
    Object.keys(data)
      // @ts-ignore
      .map((k) => esc(k) + "=" + esc(data[k]))
      .join("&")
  );
}
