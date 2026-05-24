class Report < ApplicationRecord
  belongs_to :website

  PAGE_LIMIT = 50

  def self.base_scope(ws, params)
    since = AggregatedReport.range_to_date(params[:range] || '24h')

    scope = ws.reports
      .where("created_at > ?", since)

    params
      .slice(:violated_directive, :blocked_uri, :source_file)
      .each do |p, value|
        next if value.blank?
        
        scope =
          if value == '__NONE__'
            scope.where("#{p} IS NULL OR #{p} = ''")
          else
            scope.where("#{p} = ?", value)
          end
      end

    if params[:disposition] == 'enforce'
      scope = scope.where("disposition = 'enforce' OR disposition IS NULL")
    elsif params[:disposition] == 'report'
      scope = scope.where("disposition = 'report'")
    end

    if params[:filter_extensions]
      scope = scope
        .where.not(source_file: "chrome-extension")
        .where.not(source_file: "moz-extension")
    end

    scope
  end

  def self.filter(ws, params)
    Report.base_scope(ws, params)
      .order(created_at: :desc)
      .limit(PAGE_LIMIT)
      .offset((params[:page] || 0) * PAGE_LIMIT)
  end

  def self.time_series(ws, params)
    scope = Report.base_scope(ws, params)
    distinct_directives = scope.distinct.pluck(:violated_directive)

    if params[:range] == '24h'
      start = 24.hours.ago.beginning_of_hour
      finish = Time.now.end_of_hour
      trunc = 'hour'
      step = 1.hour
    elsif params[:range] == '7d'
      start = 7.days.ago.beginning_of_day
      finish = Time.now.end_of_day
      trunc = 'day'
      step = 1.day
    elsif params[:range] == '30d'
      start = 30.days.ago.beginning_of_day
      finish = Time.now.end_of_day
      trunc = 'day'
      step = 1.day
    elsif params[:range] == '90d'
      start = 90.days.ago.beginning_of_day
      finish = Time.now.end_of_day
      trunc = 'day'
      step = 1.day
    else
      raise "unknown range"
    end

    drange = (start.to_i..finish.to_i).step(step).collect { |t| Time.at(t) }

    default_counts = {}
    drange.each do |t|
      distinct_directives.each do |directive|
        default_counts[[t, directive]] = 0
      end
    end

    res = scope
      .select("date_trunc('#{trunc}', created_at) as t, violated_directive, count(*) as count")
      .group("t, violated_directive")
      .order("t asc")

    merged = default_counts.merge(res.map { |r| [[r.t, r.violated_directive], r.count] }.to_h)

    merged.map do |k, v|
      {
        t: k[0],
        violated_directive: k[1],
        count: v
      }
    end
      .group_by { |r| r[:t] }
      .map do |k, v|
        {
          t: k,
          violated_directives: v.map { |r| { name: r[:violated_directive], count: r[:count] } }
        }
      end
        .sort_by { |r| r[:t] }

  end

  def user_agent_data
    headers = JSON.parse raw_headers.gsub('=>', ':')
    user_agent = UserAgentParser.parse headers["HTTP_USER_AGENT"]

    {
      family: user_agent.family,
      version: user_agent.version.to_s,
      os: user_agent.os.to_s,
      device: user_agent.device.to_s,
      device_brand: user_agent.device.brand,
      device_model: user_agent.device.model
    }
  end

  def parse!
    raw = extract_violation(JSON.parse(raw_body))
    self.document_uri = raw["document-uri"]
    self.violated_directive = raw["violated-directive"]

    # The violated-directive is a historic name for the effective-directive field and contains the same value.
    self.effective_directive = raw["effective-directive"]
    self.original_policy = raw["original-policy"]
    self.disposition = raw["disposition"]
    self.blocked_uri = raw["blocked-uri"]
    self.line_number = raw["line-number"]
    self.column_number = raw["column-number"]
    self.status_code = raw["status-code"]
    self.script_sample = raw["script-sample"]

    # deprecated
    self.referrer = raw["referrer"]
    self.source_file = raw["source-file"]
    self.save!
  end

  # Normalizes a parsed report body into the hyphenated keys used above.
  #
  # Two wire formats reach this endpoint:
  #   * Legacy `report-uri`  -> {"csp-report": {"document-uri": ..., ...}}  (hyphenated keys)
  #   * Modern `report-to` / Reporting API -> a JSON array of
  #     {"type": "csp-violation", "body": {"documentURL": ..., ...}}        (camelCase keys)
  #     (browsers batch into an array; we also accept a single bare object)
  def extract_violation(parsed)
    if parsed.is_a?(Array)
      entry = parsed.find { |r| r.is_a?(Hash) && r["type"] == "csp-violation" } || parsed.first
      reporting_api_body(entry)
    elsif parsed.is_a?(Hash) && parsed.key?("csp-report")
      parsed["csp-report"]
    elsif parsed.is_a?(Hash) && parsed.key?("body")
      reporting_api_body(parsed)
    else
      parsed
    end
  end

  def reporting_api_body(entry)
    body = (entry || {})["body"] || {}
    {
      "document-uri"        => body["documentURL"],
      "referrer"            => body["referrer"],
      "violated-directive"  => body["violatedDirective"] || body["effectiveDirective"],
      "effective-directive" => body["effectiveDirective"],
      "original-policy"     => body["originalPolicy"],
      "disposition"         => body["disposition"],
      "blocked-uri"         => body["blockedURL"],
      "line-number"         => body["lineNumber"],
      "column-number"       => body["columnNumber"],
      "status-code"         => body["statusCode"],
      "script-sample"       => body["sample"],
      "source-file"         => body["sourceFile"]
    }
  end

  def go_json
    {
      id: id,
      website_id: website_id,
      created_at: created_at,
      raw_body: JSON.parse(raw_body),
      document_uri: document_uri,
      violated_directive: violated_directive,
      referrer: referrer,
      effective_directive: effective_directive,
      disposition: disposition,
      blocked_uri: blocked_uri,
      line_number: line_number,
      column_number: column_number,
      status_code: status_code,
      script_sample: script_sample,
      source_file: source_file,
      original_policy: original_policy,
      user_agent: user_agent_data
    }
  end
end
