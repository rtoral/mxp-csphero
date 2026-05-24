import * as React from "react";
import { useState } from "react";
import Api from "../api";

const AddWebsitePage: React.FC<{ welcome?: boolean }> = ({ welcome }) => {
  const [domain, setDomain] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [creating, setCreating] = useState<boolean>(false);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const res = await Api.websites.create(domain);
    setCreating(false);
    if ("errors" in res) {
      setErrors(res.errors);
    } else {
      window.location.href = `/#/domains/${res.id}/edit`;
    }
  };

  return (
    <main className="add-website-page">
      <div className="container">
        <div className="website-form">
          {welcome ? (
            <>
              <h1>Get started</h1>
              <p className="hint">
                Let's add your first website to start collecting CSP reports.
              </p>
            </>
          ) : (
            <h1>Add Website</h1>
          )}
          {errors.length > 0 && (
            <div className="errors">
              {errors.map((e) => (
                <div key={e}>{e}</div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="domain">Domain</label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={handleDomainChange}
                autoFocus
              />
              <div className="hint">
                The website you want to monitor in the format{" "}
                <code>example.com</code> or <code>www.mywebsite.io</code>
              </div>
            </div>
            <div className="form-group">
              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AddWebsitePage;
