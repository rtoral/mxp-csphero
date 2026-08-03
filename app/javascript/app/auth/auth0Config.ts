// Populated from .env at build time by Vite (must be prefixed VITE_ to be
// exposed to client code) — see Rails-side AUTH0_DOMAIN/AUTH0_AUDIENCE in
// Auth0TokenVerifier for the counterpart used to verify tokens.
export const auth0Domain: string = import.meta.env["VITE_AUTH0_DOMAIN"];
export const auth0ClientId: string = import.meta.env["VITE_AUTH0_CLIENT_ID"];
export const auth0Audience: string = import.meta.env["VITE_AUTH0_AUDIENCE"];
