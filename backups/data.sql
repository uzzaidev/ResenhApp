--
-- PostgreSQL database dump
--

\restrict rimt4nB3ZAHlwKVHb09SIJwWyN4h6ZeLGDoY8BeIfUuP8lZrIjVaksxOWHgk8ye

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified, password_hash, image, created_at, updated_at) FROM stdin;
e5ef95c2-35a6-4e86-abd4-61cee40a87cb	Pedro Vitor Brunello Pagliarin	pedro.pagliarin@uzzai.com.br	\N	$2a$10$Pltr1tb7Tji4Xp4JC1BEk.4CpWUla.uHTtejDqnDVE27U2he8Go42	\N	2026-01-23 18:40:47.921176	2026-01-23 18:40:47.921176
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, description, privacy, photo_url, created_by, created_at, updated_at, parent_group_id, group_type, pix_code, credits_balance, credits_purchased, credits_consumed) FROM stdin;
ece94980-2440-4eed-9806-2363fb773134	tESTE	TEeste 	private	\N	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-23 18:41:03.532436	2026-01-23 18:41:03.532436	\N	pelada	\N	0	0	0
5dd9f670-ee5a-4174-9366-ba0e9d381810	Atletitca teste	\N	public	\N	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-24 20:11:44.261453	2026-01-24 20:11:44.261453	\N	athletic	\N	0	0	0
3ed36012-d350-4c2e-a56d-239c9d2fd9ec	TESTE b	\N	private	\N	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-25 01:31:29.004927	2026-01-25 01:31:29.004927	\N	athletic	\N	0	0	0
814144bd-6d7f-44d1-bac1-3766c17975c8	Pelada teste	TGeste	private	\N	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-26 18:20:58.063668	2026-01-26 18:20:58.063668	\N	pelada	\N	0	0	0
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, code, full_name, display_name, nickname, bio, avatar_url, platform_role, total_groups_owned, total_groups_member, preferred_position, is_goalkeeper_capable, phone, whatsapp, city, state, country, location, notification_preferences, privacy_settings, onboarding_completed, terms_accepted_at, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sport_modalities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sport_modalities (id, name, icon, color, group_id, positions, trainings_per_week, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: athlete_modalities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.athlete_modalities (id, user_id, modality_id, preferred_position, secondary_position, base_rating, is_active, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.venues (id, group_id, name, address, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers, status, waitlist_enabled, created_by, created_at, updated_at, is_recurring, recurrence_pattern, event_type, parent_event_id, modality_id) FROM stdin;
55dbf8b0-165c-4735-b2ce-0e731fd4f0d8	ece94980-2440-4eed-9806-2363fb773134	2026-01-25 00:00:00	\N	10	2	scheduled	t	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-23 18:41:18.843116	2026-01-23 18:41:18.843116	f	\N	training	\N	\N
898e6a3e-9c00-4e5d-8056-37a1194750a3	5dd9f670-ee5a-4174-9366-ba0e9d381810	2026-01-26 00:00:00	\N	10	2	scheduled	t	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	2026-01-24 20:12:21.173604	2026-01-24 20:12:21.173604	f	\N	training	\N	\N
\.


--
-- Data for Name: charges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.charges (id, group_id, user_id, type, amount_cents, due_date, status, created_at, updated_at, event_id) FROM stdin;
0d9e1790-d657-4894-b43b-a0d8e99f3090	5dd9f670-ee5a-4174-9366-ba0e9d381810	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	daily	1000	2026-01-27	pending	2026-01-24 20:13:15.203887	2026-01-24 20:13:15.203887	\N
\.


--
-- Data for Name: checkin_qrcodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkin_qrcodes (id, event_id, qr_code_data, qr_code_hash, expires_at, is_active, usage_count, max_uses, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkins (id, event_id, user_id, checkin_method, qr_code_id, checked_in_at, created_at) FROM stdin;
\.


--
-- Data for Name: game_convocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_convocations (id, event_id, required_positions, status, notes, deadline, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: convocation_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.convocation_responses (id, convocation_id, user_id, response, "position", responded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: credit_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_transactions (id, group_id, transaction_type, amount, description, feature_used, event_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: promo_coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promo_coupons (id, code, description, discount_type, discount_value, max_uses, max_uses_per_group, current_uses, valid_from, valid_until, is_active, created_by, created_at, updated_at) FROM stdin;
cc686b90-803d-4f88-b05c-116bab113931	WELCOME10	Desconto de 10% na primeira compra	percentage	10	\N	1	0	2026-01-24 10:33:17.359862+00	\N	t	\N	2026-01-24 10:33:17.359862+00	2026-01-24 10:33:17.359862+00
5657db0c-71ff-47a8-bc51-73de3212f45a	PROMO20	Desconto de 20% - Promoção de lançamento	percentage	20	100	1	0	2026-01-24 10:33:17.359862+00	2026-02-23 10:33:17.359862+00	t	\N	2026-01-24 10:33:17.359862+00	2026-01-24 10:33:17.359862+00
c9bb6367-f99b-4a5d-aa3c-f2d23442a1cb	SAVE500	R$ 5,00 de desconto	fixed_amount	500	50	1	0	2026-01-24 10:33:17.359862+00	2026-02-08 10:33:17.359862+00	t	\N	2026-01-24 10:33:17.359862+00	2026-01-24 10:33:17.359862+00
9828ff99-5266-496b-83ec-d0539ca0a1fa	BONUS50	+50 créditos bônus	fixed_credits	50	\N	1	0	2026-01-24 10:33:17.359862+00	\N	t	\N	2026-01-24 10:33:17.359862+00	2026-01-24 10:33:17.359862+00
0cbf130d-09d2-4198-9a58-f1927191f1a5	BONUS100	+100 créditos bônus - Oferta especial	fixed_credits	100	200	1	0	2026-01-24 10:33:17.359862+00	2026-01-31 10:33:17.359862+00	t	\N	2026-01-24 10:33:17.359862+00	2026-01-24 10:33:17.359862+00
\.


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_id, group_id, transaction_id, discount_applied, used_by, used_at) FROM stdin;
\.


--
-- Data for Name: credit_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_packages (id, name, credits_amount, price_cents, is_active, created_at, updated_at) FROM stdin;
597443e6-c6ff-48a2-888a-e520ad1fe3c8	Básico	100	2000	t	2026-01-23 23:25:17.850054+00	2026-01-23 23:25:17.850054+00
e73f82f1-2fc9-4569-8dbe-c5da62d0f311	Intermediário	300	5000	t	2026-01-23 23:25:17.850054+00	2026-01-23 23:25:17.850054+00
980c4193-f15e-415c-8216-a82249f903d7	Premium	700	10000	t	2026-01-23 23:25:17.850054+00	2026-01-23 23:25:17.850054+00
39ec30be-32fe-40c2-b089-4c8214857576	Mensal	200	3000	t	2026-01-23 23:25:17.850054+00	2026-01-23 23:25:17.850054+00
\.


--
-- Data for Name: draw_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.draw_configs (id, group_id, players_per_team, reserves_per_team, gk_count, defender_count, midfielder_count, forward_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, event_id, name, seed, is_winner, created_at) FROM stdin;
\.


--
-- Data for Name: event_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_actions (id, event_id, actor_user_id, action_type, subject_user_id, team_id, minute, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: event_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_attendance (id, event_id, user_id, role, status, preferred_position, secondary_position, checked_in_at, order_of_arrival, created_at, updated_at, removed_by_self_at) FROM stdin;
dd9f807c-524a-4e6c-8684-b94e1162455c	898e6a3e-9c00-4e5d-8056-37a1194750a3	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	gk	yes	gk	midfielder	\N	\N	2026-01-24 20:12:28.496284	2026-01-24 20:12:28.496284	\N
\.


--
-- Data for Name: event_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_settings (id, group_id, min_players, max_players, max_waitlist, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_members (id, user_id, group_id, role, is_goalkeeper, base_rating, joined_at) FROM stdin;
fa4af7a1-6809-4ebb-b27d-7df5de4612ad	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	ece94980-2440-4eed-9806-2363fb773134	admin	f	5	2026-01-23 18:41:03.565965
cdc8dec1-9743-4930-bfd1-4072f07ac1cb	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	5dd9f670-ee5a-4174-9366-ba0e9d381810	admin	f	5	2026-01-24 20:11:44.294006
856e8e85-ebd6-46e7-8d14-a9b9e37f2f59	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	3ed36012-d350-4c2e-a56d-239c9d2fd9ec	admin	f	5	2026-01-25 01:31:29.036553
0c40fe65-3b63-44d5-90a5-c2fc73d6f5cc	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	814144bd-6d7f-44d1-bac1-3766c17975c8	admin	f	5	2026-01-26 18:20:58.102428
\.


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invites (id, group_id, code, created_by, expires_at, max_uses, used_count, created_at) FROM stdin;
05200de9-5e7e-4f0b-b212-2d0ae9e4e951	ece94980-2440-4eed-9806-2363fb773134	6NY3UT08	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	\N	\N	0	2026-01-23 18:41:03.630026
c7d179ed-8078-454b-9b22-ebb2e5665d9f	5dd9f670-ee5a-4174-9366-ba0e9d381810	HK247MY1	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	\N	\N	0	2026-01-24 20:11:44.34741
eb152dd0-1532-4eb6-87b6-c2eb176ff806	3ed36012-d350-4c2e-a56d-239c9d2fd9ec	ZVHS1H7A	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	\N	\N	0	2026-01-25 01:31:29.098155
b49cbb24-1c4f-4856-b779-082711166c03	814144bd-6d7f-44d1-bac1-3766c17975c8	HSNH9XD6	e5ef95c2-35a6-4e86-abd4-61cee40a87cb	\N	\N	0	2026-01-26 18:20:58.167793
\.


--
-- Data for Name: player_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_ratings (id, event_id, rater_user_id, rated_user_id, score, tags, created_at) FROM stdin;
\.


--
-- Data for Name: saved_tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_tactics (id, group_id, modality_id, name, description, formation, field_data, is_public, is_template, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version, applied_at, applied_by, execution_time_ms) FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, team_id, user_id, "position", starter, created_at) FROM stdin;
\.


--
-- Data for Name: user_chat_themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_chat_themes (id, user_id, incoming_message_color, outgoing_message_color, background_type, background_preset, background_custom_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_name, role_description, permissions, scope, scope_id, granted_at, granted_by, expires_at, revoked_at, revoked_by) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallets (id, owner_type, owner_id, balance_cents, created_at, updated_at) FROM stdin;
261924d7-d078-489e-bb2b-fa895ad9ab99	group	ece94980-2440-4eed-9806-2363fb773134	0	2026-01-23 18:41:03.598073	2026-01-23 18:41:03.598073
c690d682-b177-4d23-bcfb-9a6b886de98d	group	5dd9f670-ee5a-4174-9366-ba0e9d381810	0	2026-01-24 20:11:44.320458	2026-01-24 20:11:44.320458
3072053c-e263-4061-acc9-40629c9a84d1	group	3ed36012-d350-4c2e-a56d-239c9d2fd9ec	0	2026-01-25 01:31:29.06745	2026-01-25 01:31:29.06745
aaff9134-d465-48e0-9712-7cc15af84b8e	group	814144bd-6d7f-44d1-bac1-3766c17975c8	0	2026-01-26 18:20:58.135969	2026-01-26 18:20:58.135969
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-01-22 14:42:39
20211116045059	2026-01-22 14:42:39
20211116050929	2026-01-22 14:42:39
20211116051442	2026-01-22 14:42:39
20211116212300	2026-01-22 14:42:39
20211116213355	2026-01-22 14:42:39
20211116213934	2026-01-22 14:42:40
20211116214523	2026-01-22 14:42:40
20211122062447	2026-01-22 14:42:40
20211124070109	2026-01-22 14:42:40
20211202204204	2026-01-22 14:42:40
20211202204605	2026-01-22 14:42:40
20211210212804	2026-01-22 14:42:41
20211228014915	2026-01-22 14:42:41
20220107221237	2026-01-22 14:42:41
20220228202821	2026-01-22 14:42:41
20220312004840	2026-01-22 14:42:41
20220603231003	2026-01-22 14:42:41
20220603232444	2026-01-22 14:42:42
20220615214548	2026-01-22 14:42:42
20220712093339	2026-01-22 14:42:42
20220908172859	2026-01-22 14:42:42
20220916233421	2026-01-22 14:42:42
20230119133233	2026-01-22 14:42:42
20230128025114	2026-01-22 14:42:42
20230128025212	2026-01-22 14:42:43
20230227211149	2026-01-22 14:42:43
20230228184745	2026-01-22 14:42:43
20230308225145	2026-01-22 14:42:43
20230328144023	2026-01-22 14:42:43
20231018144023	2026-01-22 14:42:43
20231204144023	2026-01-22 14:42:43
20231204144024	2026-01-22 14:42:44
20231204144025	2026-01-22 14:42:44
20240108234812	2026-01-22 14:42:44
20240109165339	2026-01-22 14:42:44
20240227174441	2026-01-22 14:42:44
20240311171622	2026-01-22 14:42:44
20240321100241	2026-01-22 14:42:45
20240401105812	2026-01-22 14:42:45
20240418121054	2026-01-22 14:42:45
20240523004032	2026-01-22 14:42:46
20240618124746	2026-01-22 14:42:46
20240801235015	2026-01-22 14:42:46
20240805133720	2026-01-22 14:42:46
20240827160934	2026-01-22 14:42:46
20240919163303	2026-01-22 14:42:46
20240919163305	2026-01-22 14:42:46
20241019105805	2026-01-22 14:42:47
20241030150047	2026-01-22 14:42:47
20241108114728	2026-01-22 14:42:47
20241121104152	2026-01-22 14:42:47
20241130184212	2026-01-22 14:42:48
20241220035512	2026-01-22 14:42:48
20241220123912	2026-01-22 14:42:48
20241224161212	2026-01-22 14:42:48
20250107150512	2026-01-22 14:42:48
20250110162412	2026-01-22 14:42:48
20250123174212	2026-01-22 14:42:48
20250128220012	2026-01-22 14:42:48
20250506224012	2026-01-22 14:42:49
20250523164012	2026-01-22 14:42:49
20250714121412	2026-01-22 14:42:49
20250905041441	2026-01-22 14:42:49
20251103001201	2026-01-22 14:42:49
20251120212548	2026-02-06 20:13:09
20251120215549	2026-02-06 20:13:09
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
avatars	avatars	\N	2026-01-22 15:34:46.478491+00	2026-01-22 15:34:46.478491+00	t	f	2097152	{image/jpeg,image/png,image/webp,image/gif}	\N	STANDARD
group-photos	group-photos	\N	2026-01-22 15:34:46.478491+00	2026-01-22 15:34:46.478491+00	t	f	5242880	{image/jpeg,image/png,image/webp}	\N	STANDARD
venue-photos	venue-photos	\N	2026-01-22 15:34:46.478491+00	2026-01-22 15:34:46.478491+00	t	f	5242880	{image/jpeg,image/png,image/webp}	\N	STANDARD
receipts	receipts	\N	2026-01-22 15:34:46.478491+00	2026-01-22 15:34:46.478491+00	f	f	10485760	{image/jpeg,image/png,image/webp,application/pdf}	\N	STANDARD
chat-backgrounds	chat-backgrounds	\N	2026-02-01 18:20:59.738368+00	2026-02-01 18:20:59.738368+00	t	f	6291456	{image/jpeg,image/png,image/webp}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-01-22 14:42:38.705845
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-01-22 14:42:38.733354
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-01-22 14:42:38.75619
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-01-22 14:42:38.776661
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-01-22 14:42:38.780072
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-01-22 14:42:38.787782
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-01-22 14:42:38.790528
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-01-22 14:42:38.829522
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-01-22 14:42:38.835405
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-01-22 14:42:38.840426
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-01-22 14:42:38.844357
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-01-22 14:42:38.88764
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-01-22 14:42:38.891708
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-01-22 14:42:38.894971
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-01-22 14:42:38.897929
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-01-22 14:42:38.904585
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-01-22 14:42:38.90768
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-01-22 14:42:38.911676
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-01-22 14:42:38.923012
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-01-22 14:42:38.931419
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-01-22 14:42:38.934697
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-01-22 14:42:38.939688
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-01-22 14:42:44.004552
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-22 14:42:44.052885
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-22 14:42:44.056639
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-22 14:42:44.067722
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-22 14:42:44.071573
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-22 14:42:44.093125
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-01-22 14:42:38.736272
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-01-22 14:42:38.784236
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-01-22 14:42:38.793762
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-01-22 14:42:38.821581
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-01-22 14:42:38.942969
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-01-22 14:42:38.953808
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-01-22 14:42:43.873971
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-01-22 14:42:43.878835
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-01-22 14:42:43.884544
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-01-22 14:42:43.974483
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-01-22 14:42:43.981522
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-01-22 14:42:43.988248
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-01-22 14:42:43.989819
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-01-22 14:42:43.994382
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-01-22 14:42:43.997404
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-01-22 14:42:44.010032
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-01-22 14:42:44.026325
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-01-22 14:42:44.031944
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-01-22 14:42:44.038971
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-01-22 14:42:44.044569
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-01-22 14:42:44.049359
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-01-22 14:42:44.076051
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-12 12:19:49.628646
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-12 12:19:49.668304
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-12 12:19:49.669247
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-12 12:19:49.687313
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-12 12:19:49.688724
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-12 12:19:49.689716
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-12 12:19:49.699941
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20260127000001	{"-- =====================================================\n-- Migration: Initial Schema (Extensions + Enums)\n-- Version: 1.0\n-- Date: 2026-01-27\n-- Description: Enable PostgreSQL extensions and create base enums\n-- =====================================================\n\n-- Enable required PostgreSQL extensions\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","-- UUID generation\nCREATE EXTENSION IF NOT EXISTS \\"pgcrypto\\"","-- Cryptographic functions\nCREATE EXTENSION IF NOT EXISTS \\"pg_trgm\\"","-- Trigram text search\nCREATE EXTENSION IF NOT EXISTS \\"postgis\\"","-- Geolocation support\n\n-- =====================================================\n-- ENUMS\n-- =====================================================\n\n-- User platform roles\nCREATE TYPE platform_role_type AS ENUM (\n  'player',       -- Jogador comum\n  'organizer',    -- Organizador (pode criar múltiplos grupos)\n  'admin',        -- Admin da plataforma\n  'super_admin'   -- Super admin\n)","-- Group member roles\nCREATE TYPE group_role_type AS ENUM (\n  'owner',      -- Dono do grupo\n  'admin',      -- Administrador\n  'moderator',  -- Moderador\n  'member'      -- Membro comum\n)","-- Event privacy types\nCREATE TYPE event_privacy_type AS ENUM (\n  'private',  -- Privado (apenas membros do grupo)\n  'public'    -- Público (qualquer um pode ver)\n)","-- RSVP status types\nCREATE TYPE rsvp_status_type AS ENUM (\n  'yes',       -- Confirmado\n  'no',        -- Não vai\n  'maybe',     -- Talvez\n  'waitlist'   -- Lista de espera\n)","-- Player positions\nCREATE TYPE player_position_type AS ENUM (\n  'goalkeeper',      -- Goleiro\n  'defender',        -- Zagueiro\n  'midfielder',      -- Meio-campo\n  'forward',         -- Atacante\n  'versatile'        -- Versátil\n)","-- Event action types\nCREATE TYPE event_action_type AS ENUM (\n  'goal',           -- Gol\n  'assist',         -- Assistência\n  'own_goal',       -- Gol contra\n  'yellow_card',    -- Cartão amarelo\n  'red_card',       -- Cartão vermelho\n  'save',           -- Defesa\n  'penalty_scored', -- Pênalti convertido\n  'penalty_missed'  -- Pênalti perdido\n)","-- Payment status\nCREATE TYPE payment_status_type AS ENUM (\n  'pending',    -- Pendente\n  'paid',       -- Pago\n  'cancelled',  -- Cancelado\n  'refunded'    -- Reembolsado\n)","-- Transaction types\nCREATE TYPE transaction_type_type AS ENUM (\n  'charge',      -- Cobrança\n  'payment',     -- Pagamento\n  'refund',      -- Reembolso\n  'adjustment'   -- Ajuste\n)","-- Notification channels\nCREATE TYPE notification_channel_type AS ENUM (\n  'in_app',    -- In-app\n  'email',     -- Email\n  'push',      -- Push notification\n  'whatsapp'   -- WhatsApp (futuro)\n)","-- Notification types\nCREATE TYPE notification_type_type AS ENUM (\n  'event_created',        -- Evento criado\n  'event_updated',        -- Evento atualizado\n  'event_cancelled',      -- Evento cancelado\n  'event_reminder',       -- Lembrete de evento\n  'rsvp_confirmed',       -- RSVP confirmado\n  'waitlist_moved',       -- Movido da lista de espera\n  'team_drawn',           -- Times sorteados\n  'payment_request',      -- Solicitação de pagamento\n  'payment_received',     -- Pagamento recebido\n  'achievement_unlocked', -- Conquista desbloqueada\n  'group_invite'          -- Convite para grupo\n)","-- Pix key types\nCREATE TYPE pix_key_type AS ENUM (\n  'cpf',    -- CPF\n  'cnpj',   -- CNPJ\n  'email',  -- Email\n  'phone',  -- Telefone\n  'random'  -- Chave aleatória\n)","-- Achievement categories\nCREATE TYPE achievement_category_type AS ENUM (\n  'goals',         -- Gols\n  'assists',       -- Assistências\n  'participation', -- Participação\n  'streak',        -- Sequência\n  'special'        -- Especial\n)","-- Sport modalities (futuro - multi-sport)\nCREATE TYPE sport_modality_type AS ENUM (\n  'futsal',      -- Futsal\n  'futebol',     -- Futebol\n  'society',     -- Society\n  'beach_soccer' -- Futebol de areia\n)","-- =====================================================\n-- HELPER FUNCTIONS (used by generated columns)\n-- =====================================================\n\n-- Function to check if user can create groups based on role\nCREATE OR REPLACE FUNCTION can_create_groups_check(role platform_role_type)\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN role IN ('organizer', 'admin', 'super_admin');\nEND;\n$$ LANGUAGE plpgsql IMMUTABLE","-- Function to check if user can manage platform\nCREATE OR REPLACE FUNCTION can_manage_platform_check(role platform_role_type)\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN role IN ('admin', 'super_admin');\nEND;\n$$ LANGUAGE plpgsql IMMUTABLE","-- =====================================================\n-- COMMENTS\n-- =====================================================\n\nCOMMENT ON EXTENSION \\"uuid-ossp\\" IS 'UUID generation functions'","COMMENT ON EXTENSION \\"pgcrypto\\" IS 'Cryptographic functions for secure data'","COMMENT ON EXTENSION \\"pg_trgm\\" IS 'Trigram matching for fuzzy text search'","COMMENT ON EXTENSION \\"postgis\\" IS 'Geographic objects support for venue locations'","COMMENT ON TYPE platform_role_type IS 'User roles at platform level'","COMMENT ON TYPE group_role_type IS 'User roles within a group'","COMMENT ON TYPE event_privacy_type IS 'Event visibility settings'","COMMENT ON TYPE rsvp_status_type IS 'RSVP confirmation status'","COMMENT ON TYPE player_position_type IS 'Player field positions'","COMMENT ON TYPE event_action_type IS 'In-game actions (goals, cards, etc)'","COMMENT ON TYPE payment_status_type IS 'Payment transaction status'","COMMENT ON TYPE notification_channel_type IS 'Notification delivery channels'","COMMENT ON TYPE notification_type_type IS 'Notification event types'","COMMENT ON TYPE pix_key_type IS 'Brazilian Pix key types'","COMMENT ON TYPE achievement_category_type IS 'Achievement classification'","COMMENT ON TYPE sport_modality_type IS 'Sport types (multi-sport support)'"}	initial_schema
20260127000002	{"-- =====================================================\n-- Migration: Auth & Profiles\n-- Version: 1.0\n-- Date: 2026-01-27\n-- Description: User profiles extending Supabase auth.users\n-- =====================================================\n\n-- =====================================================\n-- PROFILES TABLE (extends auth.users)\n-- =====================================================\n\nCREATE TABLE profiles (\n  -- Primary key (references Supabase auth.users)\n  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n\n  -- Unique code for user (P-00123)\n  code TEXT UNIQUE NOT NULL,\n\n  -- Basic info\n  full_name TEXT,\n  display_name TEXT,\n  nickname TEXT,\n  bio TEXT,\n  avatar_url TEXT, -- Supabase Storage: avatars bucket\n\n  -- =====================================================\n  -- CRITICAL: USER TYPE SYSTEM\n  -- =====================================================\n\n  -- Platform role (player, organizer, admin, super_admin)\n  platform_role platform_role_type NOT NULL DEFAULT 'player',\n\n  -- Generated columns for permissions\n  can_create_groups BOOLEAN GENERATED ALWAYS AS (\n    platform_role IN ('organizer', 'admin', 'super_admin')\n  ) STORED,\n\n  can_manage_platform BOOLEAN GENERATED ALWAYS AS (\n    platform_role IN ('admin', 'super_admin')\n  ) STORED,\n\n  -- =====================================================\n  -- MULTI-GROUP MANAGEMENT\n  -- =====================================================\n\n  -- Track how many groups user owns/manages\n  total_groups_owned INTEGER DEFAULT 0,\n  total_groups_member INTEGER DEFAULT 0,\n\n  -- Player preferences\n  preferred_position player_position_type DEFAULT 'versatile',\n  is_goalkeeper_capable BOOLEAN DEFAULT FALSE,\n\n  -- Contact info\n  phone TEXT,\n  whatsapp TEXT,\n\n  -- Geolocation (optional)\n  city TEXT,\n  state TEXT,\n  country TEXT DEFAULT 'BR',\n  location GEOGRAPHY(POINT, 4326), -- PostGIS\n\n  -- Notifications preferences\n  notification_preferences JSONB DEFAULT '{\n    \\"email\\": true,\n    \\"push\\": true,\n    \\"whatsapp\\": false,\n    \\"event_reminders\\": true,\n    \\"payment_alerts\\": true,\n    \\"achievement_notifications\\": true\n  }'::jsonb,\n\n  -- Privacy settings\n  privacy_settings JSONB DEFAULT '{\n    \\"profile_visibility\\": \\"public\\",\n    \\"show_stats\\": true,\n    \\"show_contact\\": false\n  }'::jsonb,\n\n  -- Platform metadata\n  onboarding_completed BOOLEAN DEFAULT FALSE,\n  terms_accepted_at TIMESTAMPTZ,\n\n  -- Timestamps\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\n  deleted_at TIMESTAMPTZ,\n\n  -- Constraints\n  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\\\\+?[1-9]\\\\d{1,14}$'),\n  CONSTRAINT valid_whatsapp CHECK (whatsapp IS NULL OR whatsapp ~ '^\\\\+?[1-9]\\\\d{1,14}$')\n)","-- =====================================================\n-- INDEXES\n-- =====================================================\n\nCREATE INDEX idx_profiles_code ON profiles(code)","CREATE INDEX idx_profiles_platform_role ON profiles(platform_role)","CREATE INDEX idx_profiles_can_create_groups ON profiles(can_create_groups) WHERE can_create_groups = TRUE","CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops)","CREATE INDEX idx_profiles_display_name_trgm ON profiles USING GIN (display_name gin_trgm_ops)","CREATE INDEX idx_profiles_location ON profiles USING GIST (location) WHERE location IS NOT NULL","CREATE INDEX idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL","-- =====================================================\n-- USER_ROLES TABLE (granular permissions)\n-- =====================================================\n\nCREATE TABLE user_roles (\n  id BIGSERIAL PRIMARY KEY,\n  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,\n\n  -- Role details\n  role_name TEXT NOT NULL,\n  role_description TEXT,\n\n  -- Permissions (JSONB for flexibility)\n  permissions JSONB DEFAULT '{}'::jsonb,\n\n  -- Scope (platform-wide or specific resource)\n  scope TEXT DEFAULT 'platform', -- 'platform', 'group', 'event'\n  scope_id BIGINT, -- Reference to specific group/event if scoped\n\n  -- Timestamps\n  granted_at TIMESTAMPTZ DEFAULT NOW(),\n  granted_by UUID REFERENCES profiles(id),\n  expires_at TIMESTAMPTZ,\n\n  -- Soft delete\n  revoked_at TIMESTAMPTZ,\n  revoked_by UUID REFERENCES profiles(id),\n\n  UNIQUE(user_id, role_name, scope, scope_id)\n)","CREATE INDEX idx_user_roles_user_id ON user_roles(user_id)","CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_id)","CREATE INDEX idx_user_roles_active ON user_roles(revoked_at) WHERE revoked_at IS NULL","-- =====================================================\n-- FUNCTIONS\n-- =====================================================\n\n-- Generate unique user code (P-00001, P-00002, etc.)\nCREATE OR REPLACE FUNCTION generate_user_code()\nRETURNS TEXT AS $$\nDECLARE\n  next_num INTEGER;\n  new_code TEXT;\nBEGIN\n  -- Get next number from sequence\n  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 3) AS INTEGER)), 0) + 1\n  INTO next_num\n  FROM profiles\n  WHERE code ~ '^P-\\\\d+$';\n\n  -- Format as P-XXXXX (5 digits)\n  new_code := 'P-' || LPAD(next_num::TEXT, 5, '0');\n\n  RETURN new_code;\nEND;\n$$ LANGUAGE plpgsql","-- Auto-generate code before insert\nCREATE OR REPLACE FUNCTION trigger_generate_user_code()\nRETURNS TRIGGER AS $$\nBEGIN\n  IF NEW.code IS NULL OR NEW.code = '' THEN\n    NEW.code := generate_user_code();\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql","CREATE TRIGGER before_insert_profile_code\nBEFORE INSERT ON profiles\nFOR EACH ROW\nEXECUTE FUNCTION trigger_generate_user_code()","-- Update updated_at timestamp\nCREATE OR REPLACE FUNCTION trigger_update_timestamp()\nRETURNS TRIGGER AS $$\nBEGIN\n  NEW.updated_at := NOW();\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql","CREATE TRIGGER before_update_profile_timestamp\nBEFORE UPDATE ON profiles\nFOR EACH ROW\nEXECUTE FUNCTION trigger_update_timestamp()","-- =====================================================\n-- HELPER FUNCTIONS FOR RLS\n-- =====================================================\n\n-- Check if user is organizer or higher\nCREATE OR REPLACE FUNCTION is_organizer(user_id UUID)\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1 FROM profiles\n    WHERE id = user_id\n    AND platform_role IN ('organizer', 'admin', 'super_admin')\n    AND deleted_at IS NULL\n  );\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- Check if user is admin or higher\nCREATE OR REPLACE FUNCTION is_platform_admin(user_id UUID)\nRETURNS BOOLEAN AS $$\nBEGIN\n  RETURN EXISTS (\n    SELECT 1 FROM profiles\n    WHERE id = user_id\n    AND platform_role IN ('admin', 'super_admin')\n    AND deleted_at IS NULL\n  );\nEND;\n$$ LANGUAGE plpgsql SECURITY DEFINER","-- =====================================================\n-- COMMENTS\n-- =====================================================\n\nCOMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with multi-group management'","COMMENT ON COLUMN profiles.platform_role IS 'User role at platform level (player, organizer, admin, super_admin)'","COMMENT ON COLUMN profiles.can_create_groups IS 'Generated: TRUE if user can create groups (organizer+)'","COMMENT ON COLUMN profiles.can_manage_platform IS 'Generated: TRUE if user can manage platform (admin+)'","COMMENT ON COLUMN profiles.total_groups_owned IS 'Counter: number of groups user owns'","COMMENT ON COLUMN profiles.total_groups_member IS 'Counter: number of groups user is member of'","COMMENT ON TABLE user_roles IS 'Granular permissions system for custom roles'","COMMENT ON COLUMN user_roles.scope IS 'Permission scope: platform, group, or event'","COMMENT ON COLUMN user_roles.permissions IS 'JSONB object with specific permissions'"}	auth_profiles
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict rimt4nB3ZAHlwKVHb09SIJwWyN4h6ZeLGDoY8BeIfUuP8lZrIjVaksxOWHgk8ye

