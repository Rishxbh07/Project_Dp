-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.achievements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon_url text,
  task_type text NOT NULL,
  task_threshold integer NOT NULL,
  reward_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_activity_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_activity_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(user_id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'moderator'::admin_role,
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::subscription_status,
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  is_access_confirmed_by_host boolean DEFAULT false,
  host_confirmation_timestamp timestamp with time zone,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  payment_status text NOT NULL DEFAULT 'not paid '::text,
  invite_link_shared text,
  adress_shared text,
  paid_until date,
  agent_notes text,
  current_flow_node_id text DEFAULT 'NEW_USER_ONBOARDING'::text,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT bookings_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_current_flow_node_id_fkey FOREIGN KEY (current_flow_node_id) REFERENCES public.flow_nodes(node_id)
);
CREATE TABLE public.communication_log (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  booking_id uuid NOT NULL,
  actor_id uuid NOT NULL,
  message_sent text NOT NULL,
  secure_credential_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communication_log_pkey PRIMARY KEY (id),
  CONSTRAINT communication_log_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT communication_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id),
  CONSTRAINT communication_log_secure_credential_id_fkey FOREIGN KEY (secure_credential_id) REFERENCES public.secure_credentials(id)
);
CREATE TABLE public.communication_read_status (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  booking_id uuid NOT NULL,
  participant_id uuid NOT NULL,
  last_seen_log_id bigint,
  last_seen_at timestamp with time zone,
  CONSTRAINT communication_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT communication_read_status_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT communication_read_status_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.profiles(id),
  CONSTRAINT communication_read_status_last_seen_log_id_fkey FOREIGN KEY (last_seen_log_id) REFERENCES public.communication_log(id)
);
CREATE TABLE public.connected_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE CHECK (booking_id IS NOT NULL),
  host_id uuid,
  buyer_id uuid NOT NULL,
  service_uid text,
  service_profile_name text,
  profile_link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  service_pfp_link text,
  account_confirmation text NOT NULL DEFAULT 'no'::text,
  service_id text,
  joined_email text,
  CONSTRAINT connected_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT connected_accounts_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT connected_accounts_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT connected_accounts_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.credential_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  host_id uuid NOT NULL,
  user_id uuid NOT NULL,
  request_type jsonb NOT NULL,
  request_creation_reason text,
  request_status USER-DEFINED NOT NULL DEFAULT 'pending_host'::request_status,
  joining_details jsonb,
  request_created_at timestamp with time zone NOT NULL DEFAULT now(),
  request_expires_at timestamp with time zone,
  message_expires_at timestamp with time zone,
  details_sent_at timestamp with time zone,
  details_seen_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  additional_info jsonb,
  user_acess_confirmation_status USER-DEFINED NOT NULL DEFAULT 'pending'::confirmation_status_enum,
  CONSTRAINT credential_requests_pkey PRIMARY KEY (id),
  CONSTRAINT credential_requests_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT credential_requests_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT credential_requests_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT credential_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.credit_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  booking_id uuid,
  amount numeric NOT NULL,
  type text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT credit_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT credit_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.credit_wallets (
  user_id uuid NOT NULL,
  credit_balance numeric NOT NULL DEFAULT 0.00 CHECK (credit_balance >= 0::numeric),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT credit_wallets_pkey PRIMARY KEY (user_id),
  CONSTRAINT credit_wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.disputes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE,
  transaction_id uuid NOT NULL,
  raised_by_id uuid NOT NULL,
  host_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  notes text,
  resolved_by_admin_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT disputes_pkey PRIMARY KEY (id),
  CONSTRAINT disputes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT disputes_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT disputes_raised_by_id_fkey FOREIGN KEY (raised_by_id) REFERENCES public.profiles(id),
  CONSTRAINT disputes_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT disputes_resolved_by_admin_id_fkey FOREIGN KEY (resolved_by_admin_id) REFERENCES public.admins(user_id)
);
CREATE TABLE public.flow_nodes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  service_id text,
  node_id text NOT NULL UNIQUE,
  parent_node_id text,
  actor_role text NOT NULL CHECK (actor_role = ANY (ARRAY['user'::text, 'host'::text])),
  button_label text NOT NULL,
  message_to_send text NOT NULL,
  action_on_click text NOT NULL DEFAULT 'SHOW_CHILD_NODES'::text,
  CONSTRAINT flow_nodes_pkey PRIMARY KEY (id),
  CONSTRAINT flow_nodes_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT flow_nodes_parent_node_id_fkey FOREIGN KEY (parent_node_id) REFERENCES public.flow_nodes(node_id)
);
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::friendship_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT friendships_pkey PRIMARY KEY (id),
  CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id),
  CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.host_form_definitions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  service_id text NOT NULL,
  form_key text NOT NULL,
  form_definition jsonb NOT NULL,
  CONSTRAINT host_form_definitions_pkey PRIMARY KEY (id),
  CONSTRAINT host_form_definitions_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.host_user_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  user_id uuid NOT NULL,
  listing_id uuid,
  service_id text NOT NULL,
  service_name text,
  sharing_method text NOT NULL,
  message_type text DEFAULT 'manual'::text,
  raw_content text,
  sanitized_content text,
  is_encrypted boolean DEFAULT false,
  encryption_key_id uuid,
  sent_at timestamp with time zone DEFAULT now(),
  seen_at timestamp with time zone,
  expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  archived_at timestamp with time zone,
  status text DEFAULT 'delivered'::text,
  meta jsonb DEFAULT '{}'::jsonb,
  booking_id uuid,
  additional_data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT host_user_messages_pkey PRIMARY KEY (id),
  CONSTRAINT host_user_messages_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT host_user_messages_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT host_user_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT host_user_messages_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT host_user_messages_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.invite_link (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE,
  listing_id uuid NOT NULL,
  service_id text NOT NULL,
  host_id uuid NOT NULL,
  user_id uuid NOT NULL,
  invite_link text,
  address text,
  status USER-DEFINED NOT NULL DEFAULT 'pending_host_invite'::invite_status,
  details_sent_at timestamp with time zone,
  details_revealed_at timestamp with time zone,
  user_join_confirmed_at timestamp with time zone,
  host_identity_confirmed_at timestamp with time zone,
  host_mismatch_reported_at timestamp with time zone,
  host_action text,
  host_link_send_status text DEFAULT 'not_sent'::text,
  user_details_updated_at timestamp with time zone,
  host_mismatch_reported_at_2 timestamp with time zone,
  CONSTRAINT invite_link_pkey PRIMARY KEY (id),
  CONSTRAINT invite_link_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT invite_link_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT invite_link_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT invite_link_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT invite_link_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  service_id text NOT NULL,
  seats_total integer NOT NULL CHECK (seats_total > 0),
  seats_available integer NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  plan_purchased_date date CHECK (plan_purchased_date > '2025-01-01'::date),
  archive_reason text,
  total_rating integer NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  user_count integer NOT NULL DEFAULT 0,
  avg_joining_time text,
  is_public boolean NOT NULL DEFAULT true,
  alias_name text,
  seats_originally_offered integer CHECK (seats_originally_offered > 0),
  instant_share boolean NOT NULL DEFAULT false,
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT listings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.partnership_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  organization_name text NOT NULL,
  organization_type text NOT NULL,
  location text NOT NULL,
  contact_person_name text NOT NULL,
  position text NOT NULL,
  personal_email text NOT NULL,
  organization_email text,
  phone_number text NOT NULL,
  interested_services ARRAY NOT NULL,
  other_service_details text,
  additional_message text,
  status text DEFAULT 'new'::text,
  CONSTRAINT partnership_leads_pkey PRIMARY KEY (id)
);
CREATE TABLE public.popular_plans (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  listing_id uuid NOT NULL,
  service_id text NOT NULL,
  host_id uuid NOT NULL,
  service_name text NOT NULL,
  base_price numeric,
  average_rating numeric,
  host_rating numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT popular_plans_pkey PRIMARY KEY (id),
  CONSTRAINT popular_plans_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT popular_plans_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT popular_plans_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  host_rating numeric DEFAULT 0,
  loyalty_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  pfp_url text,
  host_tier USER-DEFINED NOT NULL DEFAULT 'standard'::host_tier,
  tags ARRAY DEFAULT '{}'::text[],
  profile_visibility USER-DEFINED NOT NULL DEFAULT 'public'::profile_visibility_options,
  friend_request_privacy USER-DEFINED NOT NULL DEFAULT 'everyone'::friend_request_privacy,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.promo_codes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  code text NOT NULL UNIQUE,
  user_id uuid,
  achievement_id bigint,
  discount_amount numeric NOT NULL,
  service_id text,
  is_used boolean DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id),
  CONSTRAINT promo_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT promo_codes_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id),
  CONSTRAINT promo_codes_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.recommended_plans (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  listing_id uuid NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  service_id text NOT NULL,
  category text,
  listing_average_rating numeric,
  host_rating numeric,
  recommended_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recommended_plans_pkey PRIMARY KEY (id),
  CONSTRAINT recommended_plans_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT recommended_plans_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.referrals (
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  referred_by_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT referrals_pkey PRIMARY KEY (user_id),
  CONSTRAINT referrals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT referrals_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.secure_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  host_id uuid NOT NULL,
  credential_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'SENT'::text CHECK (status = ANY (ARRAY['SENT'::text, 'SEEN'::text, 'EXPIRED'::text])),
  created_at timestamp with time zone DEFAULT now(),
  seen_at timestamp with time zone,
  expires_at timestamp with time zone,
  CONSTRAINT secure_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT secure_credentials_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT secure_credentials_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.service_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  service_name text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  requesting_to text,
  service_url text NOT NULL,
  CONSTRAINT service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.services (
  id text NOT NULL,
  name text NOT NULL UNIQUE,
  category text,
  max_seats_allowed integer CHECK (max_seats_allowed > 0),
  base_price numeric CHECK (base_price >= 0::numeric),
  sharing_policy USER-DEFINED NOT NULL DEFAULT 'allowed'::sharing_policy_enum,
  sharing_method USER-DEFINED,
  platform_commission_rate numeric NOT NULL DEFAULT 10.00 CHECK (platform_commission_rate >= 0::numeric),
  solo_plan_price numeric DEFAULT 0,
  tax_range jsonb NOT NULL DEFAULT '[0, 7, 12, 18]'::jsonb,
  seats_allowed_to_sell smallint CHECK (seats_allowed_to_sell > 0),
  invite_link_expiration boolean,
  is_active boolean NOT NULL DEFAULT true,
  has_manager_seat boolean NOT NULL DEFAULT false,
  billing_cycle_days integer NOT NULL DEFAULT 30,
  payout_schedule_days integer NOT NULL DEFAULT 31,
  host_config jsonb,
  user_config jsonb,
  service_metadata jsonb,
  internal_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  warnings jsonb,
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid,
  buyer_id uuid NOT NULL,
  gateway_transaction_id text,
  original_amount numeric NOT NULL,
  credits_used numeric NOT NULL DEFAULT 0,
  final_amount_charged numeric NOT NULL,
  platform_fee numeric NOT NULL,
  payout_to_host numeric NOT NULL,
  payout_status text NOT NULL DEFAULT 'held_by_gateway'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  payout_processed_at timestamp with time zone,
  billing_options text,
  expires_on timestamp with time zone NOT NULL DEFAULT (now() + '30 days'::interval),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_achievements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  achievement_id bigint NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);
CREATE TABLE public.user_activity_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid,
  action text NOT NULL,
  metadata jsonb,
  ip_address inet,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);