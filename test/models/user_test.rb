require "test_helper"

class UserTest < ActiveSupport::TestCase

  EMAIL = "test@example.com"

  setup do
    @user = User.create!(email: EMAIL, auth0_id: "auth0|test123")
  end

  test "creates a default company for a new user" do
    @user.reload

    assert @user.companies.count == 1
    company = @user.companies.first

    assert company.name == Company::DEFAULT_NAME

    ms = company.memberships.first
    assert ms.role == "owner"
    assert ms.user == @user
  end

  test "new users join the same shared company as owners" do
    other_user = User.create!(email: "other@example.com", auth0_id: "auth0|other123")

    @user.reload
    other_user.reload

    assert_equal @user.companies.first, other_user.companies.first
    assert_equal 1, Company.count

    assert_equal "owner", @user.memberships.first.role
    assert_equal "owner", other_user.memberships.first.role
  end
end
