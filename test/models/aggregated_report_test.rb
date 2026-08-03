require "test_helper"

class AggregatedReportTest < ActiveSupport::TestCase

  EMAIL = "test@example.com"

  setup do
    @user = User.create!(email: EMAIL, auth0_id: "auth0|test456")
  end

  test "loads agg reports for a website" do
    c = @user.companies.first
    ws = c.websites.create!(domain: "example.com")
    data = AggregatedReport.all(ws, "1d")
    assert_equal 0, data.length
  end

end
