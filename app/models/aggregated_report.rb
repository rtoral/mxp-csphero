require "ostruct"

class AggregatedReport

  attr_accessor :params, :count, :latest_reported_at
  
  def initialize(params, count, latest_reported_at)
    self.params = params
    self.count = count
    self.latest_reported_at = latest_reported_at
  end

  def self.range_to_date(range_str)
    if range_str === '24h'
      24.hours.ago
    elsif range_str === '7d'
      7.days.ago
    elsif range_str === '30d'
      30.days.ago
    elsif range_str === '90d'
      90.days.ago
    else
      90.days.ago
    end
  end

  def self.all(website, since_str)
    results = Report.all
      .where(website_id: website.id)
      .where("created_at > ?", AggregatedReport.range_to_date(since_str))
      .group(
        :violated_directive,
        :disposition,
        :blocked_uri,
        :source_file
      )
      .select(
        :violated_directive,
        :disposition,
        :blocked_uri,
        :source_file,
        "COUNT(*) as total",
        "max(created_at) as latest_reported_at"
      )
      .order('MAX(created_at) desc')

    results.map do |el|
      AggregatedReport.new(
        OpenStruct.new(
          violated_directive: el["violated_directive"],
          disposition: el["disposition"],
          blocked_uri: el["blocked_uri"],
          source_file: el["source_file"],
        ),
        el["total"],
        el["latest_reported_at"]
      )
    end
  end

  def go_json
    {
      params: params.to_h,
      count: self.count,
      latest_reported_at: self.latest_reported_at
    }
  end

end
