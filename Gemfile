source "https://rubygems.org"

gem "rails", "~> 8.1"
gem "propshaft"
gem 'thruster'
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "importmap-rails"

# integrates with vite
gem "vite_rails"

# authentication and authorization
gem "devise", "~> 4.9"

# parses user agent data
gem "user_agent_parser", "~> 2.15"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"
  gem "letter_opener"
end

group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem "capybara"
  gem "selenium-webdriver"
end
