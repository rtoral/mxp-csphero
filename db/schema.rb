# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2023_06_18_110834) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "companies", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "memberships", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "company_id", null: false
    t.string "role", default: "regular", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_memberships_on_company_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "reports", force: :cascade do |t|
    t.bigint "website_id", null: false
    t.text "raw_headers"
    t.jsonb "raw_body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "document_uri"
    t.string "referrer"
    t.string "violated_directive"
    t.string "effective_directive"
    t.string "disposition"
    t.string "blocked_uri"
    t.integer "status_code"
    t.text "script_sample"
    t.integer "line_number"
    t.integer "column_number"
    t.string "source_file"
    t.text "original_policy"
    t.index ["blocked_uri"], name: "index_reports_on_blocked_uri"
    t.index ["disposition"], name: "index_reports_on_disposition"
    t.index ["source_file"], name: "index_reports_on_source_file"
    t.index ["violated_directive"], name: "index_reports_on_violated_directive"
    t.index ["website_id"], name: "index_reports_on_website_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.boolean "accept_terms"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "websites", force: :cascade do |t|
    t.string "domain", null: false
    t.string "token", null: false
    t.bigint "company_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_websites_on_company_id"
    t.index ["token"], name: "index_websites_on_token", unique: true
  end

  add_foreign_key "memberships", "companies"
  add_foreign_key "memberships", "users"
  add_foreign_key "reports", "websites"
  add_foreign_key "websites", "companies"
end
