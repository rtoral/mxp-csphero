require "net/http"

# Verifies access tokens issued by Auth0 for this app's API audience.
#
# Auth0 signs tokens with a key rotated behind a JWKS endpoint
# (https://AUTH0_DOMAIN/.well-known/jwks.json) — instead of a shared secret, so
# we fetch/cache the current public keys and let the `jwt` gem match the
# token's `kid` header against them.
module Auth0TokenVerifier
  class InvalidToken < StandardError; end

  JWKS_CACHE_KEY = "auth0_jwks"

  class << self
    # Returns the decoded payload (a Hash) for a valid token, raising
    # InvalidToken otherwise.
    def verify(token)
      domain = ENV.fetch("AUTH0_DOMAIN")
      audience = ENV.fetch("AUTH0_AUDIENCE")

      payload, = JWT.decode(
        token,
        nil,
        true,
        algorithms: ["RS256"],
        iss: "https://#{domain}/",
        verify_iss: true,
        aud: audience,
        verify_aud: true,
        jwks: jwks_loader(domain)
      )

      payload
    rescue JWT::DecodeError, JWT::VerificationError => e
      raise InvalidToken, e.message
    end

    private

    def jwks_loader(domain)
      lambda do |options|
        fetch_jwks(domain, force: options[:invalidate])
      end
    end

    def fetch_jwks(domain, force: false)
      Rails.cache.fetch(JWKS_CACHE_KEY, expires_in: 1.hour, force: force) do
        JSON.parse(Net::HTTP.get(URI("https://#{domain}/.well-known/jwks.json")))
      end
    end
  end
end
