import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../api";
import type { Website } from "../models";

const DomainEditPage: React.FC = () => {
  const [website, setWebsite] = useState<Website | null>(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      return;
    }
    Api.websites.get(id).then((res) => {
      setWebsite(res);
    });
  }, [id]);

  return (
    <main className="website-edit-page">
      <div className="container">
        {website !== null && (
          <>
            <div className="website-info">
              <div className="instructions-block">
                <p className="secondary" style={{ marginBottom: "8px" }}>
                  Use the following report uri:
                </p>
                <div className="report-uri">
                  <code>{reportUri(website.token)}</code>
                </div>
              </div>
            </div>

            <div className="i2">
              <h2>How to setup your website?</h2>
              <p>
                Update your Content-Security-Policy directive to include the{" "}
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri"
                  target="_blank"
                  rel="noreferrer"
                >
                  report-uri
                </a>{" "}
                directive
              </p>
              <pre>
                <code>
                  Content-Security-Policy: ...; report-uri{" "}
                  {reportUri(website.token)};
                </code>
              </pre>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

function reportUri(token: string) {
  return `https://app.csphero.com/report/${token}`;
}

export default DomainEditPage;
