class User < ApplicationRecord
  validates :auth0_id, presence: true, uniqueness: true

  has_many :memberships, dependent: :destroy
  has_many :companies, through: :memberships

  has_many :websites, through: :companies

  # create default company
  after_create :create_default_company

  # Finds the User for a verified Auth0 token payload, creating one on first
  # login. `sub` is Auth0's stable per-user id (e.g. "auth0|abc123" or
  # "google-oauth2|...") — it never changes even if the user's email does.
  def self.find_or_create_from_auth0(payload)
    find_or_create_by!(auth0_id: payload["sub"]) do |user|
      user.email = payload["email"]
    end
  end

  def create_default_company
    company = Company.create!(name: "DEFAULT")
    Membership.create!(company: company, user: self, role: "owner")
  end

  def go_json
    {
      companies: companies.map do |c|
        {
          id: c.id,
          name: c.name,
          websites: c.websites.map(&:go_json)
        }
      end
    }
  end
end
