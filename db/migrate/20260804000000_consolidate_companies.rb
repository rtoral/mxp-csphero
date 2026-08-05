class ConsolidateCompanies < ActiveRecord::Migration[8.1]
  class MigrationCompany < ActiveRecord::Base
    self.table_name = "companies"
    has_many :memberships, class_name: "ConsolidateCompanies::MigrationMembership", foreign_key: :company_id
    has_many :websites, class_name: "ConsolidateCompanies::MigrationWebsite", foreign_key: :company_id
  end

  class MigrationMembership < ActiveRecord::Base
    self.table_name = "memberships"
  end

  class MigrationWebsite < ActiveRecord::Base
    self.table_name = "websites"
  end

  DEFAULT_NAME = "Maxipublica"

  def up
    canonical = MigrationCompany.find_or_create_by!(name: DEFAULT_NAME)

    MigrationCompany.where.not(id: canonical.id).find_each do |company|
      company.websites.find_each do |website|
        website.update!(company_id: canonical.id)
      end

      company.memberships.find_each do |membership|
        already_member = MigrationMembership.exists?(company_id: canonical.id, user_id: membership.user_id)
        MigrationMembership.create!(company_id: canonical.id, user_id: membership.user_id, role: "owner") unless already_member
        membership.destroy!
      end

      company.reload
      company.destroy! if company.websites.count.zero? && company.memberships.count.zero?
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
