-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  status text NOT NULL DEFAULT 'active'::text,
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  is_access_confirmed_by_host boolean DEFAULT false,
  host_confirmation_timestamp timestamp with time zone,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT bookings_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.connected_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE,
  dapbuddy_subscription_id uuid UNIQUE,
  host_id uuid,
  buyer_id uuid NOT NULL,
  service_username text,
  service_profile_name text,
  invite_link text,
  credentials_encrypted text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT connected_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT connected_accounts_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT connected_accounts_dapbuddy_subscription_id_fkey FOREIGN KEY (dapbuddy_subscription_id) REFERENCES public.dapbuddy_subscriptions(id),
  CONSTRAINT connected_accounts_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
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
CREATE TABLE public.dapbuddy_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id text NOT NULL,
  platform_price numeric NOT NULL,
  seats_total integer NOT NULL,
  seats_available integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT dapbuddy_plans_pkey PRIMARY KEY (id),
  CONSTRAINT dapbuddy_plans_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.dapbuddy_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  transaction_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT dapbuddy_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT dapbuddy_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.dapbuddy_plans(id),
  CONSTRAINT dapbuddy_subscriptions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT dapbuddy_subscriptions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
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
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  service_id text NOT NULL,
  seats_total integer NOT NULL CHECK (seats_total > 0),
  seats_available integer NOT NULL,
  average_rating numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id),
  CONSTRAINT listings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.platform_service_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  service_id text NOT NULL UNIQUE,
  master_username text NOT NULL,
  master_password_encrypted text NOT NULL,
  notes text,
  updated_at timestamp with time zone,
  CONSTRAINT platform_service_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT platform_service_credentials_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.popular_services (
  service_id text NOT NULL,
  listing_count integer NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT popular_services_pkey PRIMARY KEY (service_id),
  CONSTRAINT popular_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  host_rating numeric DEFAULT 0,
  loyalty_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
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
CREATE TABLE public.service_requests (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  requested_service_name text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT service_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.services (
  id text NOT NULL,
  name text NOT NULL UNIQUE,
  category text,
  max_seats_allowed integer,
  base_price numeric,
  platform_price numeric,
  sharing_policy USER-DEFINED NOT NULL DEFAULT 'allowed'::sharing_policy_enum,
  sharing_method USER-DEFINED,
  platform_commission_rate numeric NOT NULL DEFAULT 10.00 CHECK (platform_commission_rate >= 0::numeric),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.super_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT super_admins_pkey PRIMARY KEY (id),
  CONSTRAINT super_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
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
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id)
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