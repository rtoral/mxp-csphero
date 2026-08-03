class RemoveDeviseAddAuth0ToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :auth0_id, :string
    add_index :users, :auth0_id, unique: true

    change_column_null :users, :email, true
    change_column_default :users, :email, from: "", to: nil

    remove_column :users, :encrypted_password, :string, default: "", null: false
    remove_column :users, :confirmation_sent_at, :datetime
    remove_column :users, :confirmation_token, :string
    remove_column :users, :confirmed_at, :datetime
    remove_column :users, :current_sign_in_at, :datetime
    remove_column :users, :current_sign_in_ip, :string
    remove_column :users, :last_sign_in_at, :datetime
    remove_column :users, :last_sign_in_ip, :string
    remove_column :users, :remember_created_at, :datetime
    remove_column :users, :reset_password_sent_at, :datetime
    remove_column :users, :reset_password_token, :string
    remove_column :users, :sign_in_count, :integer, default: 0, null: false
    remove_column :users, :unconfirmed_email, :string
  end
end
