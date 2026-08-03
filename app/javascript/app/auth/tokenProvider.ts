// api.ts needs the current Auth0 access token on every request, but it's a
// plain module, not a component — it can't call the useAuth0() hook. AuthGate
// registers getAccessTokenSilently here once auth0-react has it, so api.ts
// can pull the token without depending on React context.
type TokenGetter = () => Promise<string>;

let getter: TokenGetter | null = null;

export function setTokenGetter(fn: TokenGetter): void {
  getter = fn;
}

export function getAccessToken(): Promise<string> {
  if (!getter) {
    return Promise.reject(new Error("Auth0 token getter not ready yet"));
  }
  return getter();
}
