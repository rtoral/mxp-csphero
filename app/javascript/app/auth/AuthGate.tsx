import * as React from "react";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Spinner from "../Spinner";
import { setTokenGetter } from "./tokenProvider";

// Mirrors the old server-side behavior (AppController redirected to the
// Devise login page whenever there was no session): renders nothing but a
// spinner until Auth0 confirms a session, kicking off loginWithRedirect if
// there isn't one.
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    setTokenGetter(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, error, loginWithRedirect]);

  if (error) {
    return (
      <div className="app">
        <main>
          <p>Login error: {error.message}</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <main>
          <Spinner />
        </main>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
