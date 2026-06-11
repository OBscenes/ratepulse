-- Seed all 12 sending corridors (diaspora → Africa) with 5 platforms each.
-- 60 rows total. Safe to re-run — ON CONFLICT DO NOTHING skips existing rows.
--
-- Platforms: LemFi, Pesa, Africhange, Raenest, SendApp
-- Corridors: gbp/usd/cad/eur → ngn/ghs/kes

INSERT INTO platforms (corridor, platform_id, name, color, active, sending_rate, receiving_rate)
VALUES
  -- gbp-ngn
  ('gbp-ngn', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('gbp-ngn', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('gbp-ngn', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('gbp-ngn', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('gbp-ngn', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- gbp-ghs
  ('gbp-ghs', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('gbp-ghs', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('gbp-ghs', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('gbp-ghs', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('gbp-ghs', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- gbp-kes
  ('gbp-kes', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('gbp-kes', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('gbp-kes', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('gbp-kes', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('gbp-kes', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- usd-ngn
  ('usd-ngn', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('usd-ngn', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('usd-ngn', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('usd-ngn', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('usd-ngn', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- usd-ghs
  ('usd-ghs', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('usd-ghs', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('usd-ghs', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('usd-ghs', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('usd-ghs', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- usd-kes
  ('usd-kes', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('usd-kes', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('usd-kes', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('usd-kes', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('usd-kes', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- cad-ngn
  ('cad-ngn', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('cad-ngn', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('cad-ngn', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('cad-ngn', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('cad-ngn', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- cad-ghs
  ('cad-ghs', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('cad-ghs', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('cad-ghs', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('cad-ghs', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('cad-ghs', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- cad-kes
  ('cad-kes', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('cad-kes', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('cad-kes', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('cad-kes', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('cad-kes', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- eur-ngn
  ('eur-ngn', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('eur-ngn', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('eur-ngn', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('eur-ngn', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('eur-ngn', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- eur-ghs
  ('eur-ghs', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('eur-ghs', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('eur-ghs', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('eur-ghs', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('eur-ghs', 'sendapp',    'SendApp',     '#4ade80', true, null, null),

  -- eur-kes
  ('eur-kes', 'lemfi',      'LemFi',      '#f59e0b', true, null, null),
  ('eur-kes', 'pesa',       'Pesa',        '#a78bfa', true, null, null),
  ('eur-kes', 'africhange', 'Africhange',  '#34d399', true, null, null),
  ('eur-kes', 'raenest',    'Raenest',     '#60a5fa', true, null, null),
  ('eur-kes', 'sendapp',    'SendApp',     '#4ade80', true, null, null)

ON CONFLICT (corridor, platform_id) DO NOTHING;
