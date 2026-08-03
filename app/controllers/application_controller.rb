class ApplicationController < ActionController::Base
  # Auth now travels as a bearer token the browser never attaches
  # automatically, so there's no ambient-credential CSRF vector left to guard
  # against (unlike the old Devise cookie session).
  skip_forgery_protection

  rescue_from Auth0TokenVerifier::InvalidToken, with: :render_unauthorized

  def current_user
    @current_user
  end

  # Verifies the Authorization: Bearer <token> header against Auth0 and
  # memoizes the corresponding User. Raises Auth0TokenVerifier::InvalidToken
  # (rescued below) when the header is missing or the token doesn't check out.
  def authenticate_user!
    @current_user ||= begin
      token = request.headers["Authorization"]&.split("Bearer ", 2)&.last
      raise Auth0TokenVerifier::InvalidToken, "missing token" if token.blank?

      payload = Auth0TokenVerifier.verify(token)
      User.find_or_create_from_auth0(payload)
    end
  end

  private

  def render_unauthorized
    render json: { error: "unauthorized" }, status: :unauthorized
  end
end
