require "test_helper"

class Auth0AuthenticationTest < ActionDispatch::IntegrationTest
  # Each test below redefines Auth0TokenVerifier.verify for its duration
  # (removed in an `ensure`), since actually verifying would require hitting
  # Auth0's live JWKS endpoint.

  test "rejects requests without a bearer token" do
    get "/api/users/me"
    assert_response :unauthorized
  end

  test "rejects requests with a token Auth0 doesn't validate" do
    Auth0TokenVerifier.singleton_class.send(:define_method, :verify) do |_token|
      raise Auth0TokenVerifier::InvalidToken, "bad token"
    end

    get "/api/users/me", headers: { "Authorization" => "Bearer garbage" }
    assert_response :unauthorized
  ensure
    Auth0TokenVerifier.singleton_class.send(:remove_method, :verify)
  end

  test "accepts a valid token and creates the user on first login" do
    payload = { "sub" => "auth0|new-user", "email" => "new-user@example.com" }
    Auth0TokenVerifier.singleton_class.send(:define_method, :verify) { |_token| payload }

    assert_difference("User.count", 1) do
      get "/api/users/me", headers: { "Authorization" => "Bearer valid" }
    end

    assert_response :success
    assert User.exists?(auth0_id: "auth0|new-user")
  ensure
    Auth0TokenVerifier.singleton_class.send(:remove_method, :verify)
  end
end
