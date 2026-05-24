class AddCompositeIndexToReports < ActiveRecord::Migration[8.1]
  # CONCURRENTLY can't run inside a transaction.
  disable_ddl_transaction!

  def change
    # Every dashboard query filters `website_id = ? AND created_at > ?`
    # (AggregatedReport.all, Report.filter, Report.time_series). A composite
    # index on (website_id, created_at) serves that access pattern directly.
    add_index :reports, [:website_id, :created_at],
              algorithm: :concurrently,
              if_not_exists: true

    # The standalone website_id index is now redundant: the composite above
    # serves website_id-only lookups via its leftmost prefix. Dropping it
    # removes write overhead on this high-volume table.
    remove_index :reports, :website_id,
                 name: "index_reports_on_website_id",
                 algorithm: :concurrently,
                 if_exists: true
  end
end
