Rails.application.routes.draw do

  # root fot the dashboard
  root to: "app#index"
  
  get '/terms', to: 'app#terms'

  # collect reports
  post '/report/:token', to: 'reports#create'

  # api used by the dashboard frontend
  namespace :api do
    resources :websites, only: [:index, :show, :create]
    resources :reports, only: [:index] do
      collection do
        get :aggs
        get :time_series
      end
    end
    resources :users, only: [] do
      collection do
        get :me
      end
    end
  end

end
