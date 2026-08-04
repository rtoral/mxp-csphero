namespace :companies do
  desc "Merge all companies into a single shared company, moving over websites and memberships"
  task consolidate: :environment do
    canonical = Company.find_or_create_by!(name: Company::DEFAULT_NAME)

    Company.where.not(id: canonical.id).find_each do |company|
      company.websites.find_each do |website|
        website.update!(company: canonical)
      end

      company.memberships.find_each do |membership|
        unless canonical.memberships.exists?(user_id: membership.user_id)
          Membership.create!(company: canonical, user: membership.user, role: "owner")
        end
        membership.destroy!
      end

      company.reload
      if company.websites.count.zero? && company.memberships.count.zero?
        company.destroy!
        puts "Merged and removed company ##{company.id} (#{company.name})"
      else
        puts "WARNING: company ##{company.id} (#{company.name}) still has data after merge attempt, left in place"
      end
    end

    puts "Done. #{Company.count} compan#{Company.count == 1 ? "y" : "ies"} remaining."
  end
end
