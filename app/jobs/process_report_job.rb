class ProcessReportJob < ApplicationJob
  queue_as :ingest

  # The raw report row is persisted synchronously in the controller; here we do
  # the heavier work of parsing the JSON body and extracting the columns used by
  # the dashboard. Parsing is idempotent, so retries are safe.
  discard_on ActiveJob::DeserializationError

  def perform(report_id)
    report = Report.find_by(id: report_id)
    return if report.nil?

    report.parse!
  end
end
