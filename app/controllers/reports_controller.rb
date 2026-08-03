class ReportsController < ApplicationController
  def create
    website = Website.find_by(token: params[:token])
    if website.nil?
      render json: { error: 'Invalid token' }, status: :unprocessable_entity
      return
    end

    raw_headers = request.headers.env.select { |k, _v| k.start_with?('HTTP_') }
    raw_json_body = request.body.read

    # store raw data, and defer the processing
    report = website.reports.create!(
      raw_headers: raw_headers,
      raw_body: raw_json_body
    )

    ProcessReportJob.perform_later(report.id)

    render json: { message: 'Report accepted' }, status: :accepted
  end
end
