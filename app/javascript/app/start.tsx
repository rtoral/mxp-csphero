import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "../app/App";
import AuthGate from "./auth/AuthGate";
import { auth0Audience, auth0ClientId, auth0Domain } from "./auth/auth0Config";

import "./styles/index.scss";

// Auth0 redirects back with ?code=...&state=... in the query string; strip it
// so it doesn't linger in the address bar (the HashRouter route itself lives
// after the #, so it's untouched by this).
function onRedirectCallback() {
  window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
}

export const start = () => {
  const container = document.getElementById("root");

  if (!container) {
    console.log("No root element found: #root");
  } else {
    // create a root
    const root = createRoot(container);

    //render app to root
    root.render(
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: auth0Audience,
        }}
        onRedirectCallback={onRedirectCallback}
      >
        <AuthGate>
          <App />
        </AuthGate>
      </Auth0Provider>,
    );
  }
};
