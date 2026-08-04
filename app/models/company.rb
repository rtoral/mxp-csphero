class Company < ApplicationRecord
  DEFAULT_NAME = "Maxipublica"

  validates :name, presence: true

  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships

  has_many :websites, dependent: :destroy
end
