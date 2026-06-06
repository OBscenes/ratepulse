// Canonical platform/margin defaults — source of truth for seeding and fallback

export const DEFAULT_PLATFORMS = [
  // GBP → NGN
  { corridor: 'GBP-NGN', platform_id: 'lemfi',       name: 'LemFi',         margin:  0.4401, color: '#f59e0b', type: 'sending',   active: true },
  { corridor: 'GBP-NGN', platform_id: 'sendapp',     name: 'SendApp',       margin: -0.6202, color: '#4ade80', type: 'sending',   active: true },
  { corridor: 'GBP-NGN', platform_id: 'africhange',  name: 'Africhange',    margin: -0.6398, color: '#34d399', type: 'sending',   active: true },
  { corridor: 'GBP-NGN', platform_id: 'pesa',        name: 'Pesa',          margin: -0.6999, color: '#a78bfa', type: 'sending',   active: true },
  { corridor: 'GBP-NGN', platform_id: 'raenest',     name: 'Raenest',       margin: -0.7503, color: '#60a5fa', type: 'sending',   active: true },
  // GBP → GHS
  { corridor: 'GBP-GHS', platform_id: 'wise',        name: 'Wise',          margin: -1.9231, color: '#4ade80', type: 'sending',   active: true },
  { corridor: 'GBP-GHS', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.5385, color: '#f59e0b', type: 'sending',   active: true },
  { corridor: 'GBP-GHS', platform_id: 'remitly',     name: 'Remitly',       margin: -2.3077, color: '#f87171', type: 'sending',   active: true },
  { corridor: 'GBP-GHS', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -3.0220, color: '#a78bfa', type: 'sending',   active: true },
  { corridor: 'GBP-GHS', platform_id: 'sendwave',    name: 'Sendwave',      margin: -1.7582, color: '#34d399', type: 'sending',   active: true },
  { corridor: 'GBP-GHS', platform_id: 'westernunion',name: 'Western Union', margin: -3.8462, color: '#fbbf24', type: 'sending',   active: true },
  // EUR → NGN
  { corridor: 'EUR-NGN', platform_id: 'wise',        name: 'Wise',          margin: -1.9231, color: '#4ade80', type: 'sending',   active: true },
  { corridor: 'EUR-NGN', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.5385, color: '#f59e0b', type: 'sending',   active: true },
  { corridor: 'EUR-NGN', platform_id: 'remitly',     name: 'Remitly',       margin: -2.3077, color: '#f87171', type: 'sending',   active: true },
  { corridor: 'EUR-NGN', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -3.0220, color: '#a78bfa', type: 'sending',   active: true },
  { corridor: 'EUR-NGN', platform_id: 'sendwave',    name: 'Sendwave',      margin: -1.7582, color: '#34d399', type: 'sending',   active: true },
  { corridor: 'EUR-NGN', platform_id: 'westernunion',name: 'Western Union', margin: -3.8462, color: '#fbbf24', type: 'sending',   active: true },
  // EUR → GHS
  { corridor: 'EUR-GHS', platform_id: 'wise',        name: 'Wise',          margin: -2.2436, color: '#4ade80', type: 'sending',   active: true },
  { corridor: 'EUR-GHS', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.7949, color: '#f59e0b', type: 'sending',   active: true },
  { corridor: 'EUR-GHS', platform_id: 'remitly',     name: 'Remitly',       margin: -2.6923, color: '#f87171', type: 'sending',   active: true },
  { corridor: 'EUR-GHS', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -3.5256, color: '#a78bfa', type: 'sending',   active: true },
  { corridor: 'EUR-GHS', platform_id: 'sendwave',    name: 'Sendwave',      margin: -2.0513, color: '#34d399', type: 'sending',   active: true },
  { corridor: 'EUR-GHS', platform_id: 'westernunion',name: 'Western Union', margin: -4.4872, color: '#fbbf24', type: 'sending',   active: true },
  // NGN → GBP (receiving, invertedRate)
  { corridor: 'NGN-GBP', platform_id: 'sendapp',     name: 'SendApp',       margin:  2.1119, color: '#4ade80', type: 'receiving', active: true },
  { corridor: 'NGN-GBP', platform_id: 'africhange',  name: 'Africhange',    margin:  2.5471, color: '#34d399', type: 'receiving', active: true },
  { corridor: 'NGN-GBP', platform_id: 'raenest',     name: 'Raenest',       margin:  3.2001, color: '#60a5fa', type: 'receiving', active: true },
  { corridor: 'NGN-GBP', platform_id: 'pesa',        name: 'Pesa',          margin:  7.2256, color: '#a78bfa', type: 'receiving', active: true },
  { corridor: 'NGN-GBP', platform_id: 'lemfi',       name: 'LemFi',         margin:  7.8782, color: '#f59e0b', type: 'receiving', active: true },
  // GHS → GBP
  { corridor: 'GHS-GBP', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.3648, color: '#f59e0b', type: 'receiving', active: true },
  { corridor: 'GHS-GBP', platform_id: 'sendwave',    name: 'Sendwave',      margin: -1.7289, color: '#34d399', type: 'receiving', active: true },
  { corridor: 'GHS-GBP', platform_id: 'wise',        name: 'Wise',          margin: -2.1838, color: '#4ade80', type: 'receiving', active: true },
  { corridor: 'GHS-GBP', platform_id: 'remitly',     name: 'Remitly',       margin: -2.7298, color: '#f87171', type: 'receiving', active: true },
  { corridor: 'GHS-GBP', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -3.8217, color: '#a78bfa', type: 'receiving', active: true },
  { corridor: 'GHS-GBP', platform_id: 'westernunion',name: 'Western Union', margin: -5.0955, color: '#fbbf24', type: 'receiving', active: true },
  // NGN → EUR
  { corridor: 'NGN-EUR', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.5469, color: '#f59e0b', type: 'receiving', active: true },
  { corridor: 'NGN-EUR', platform_id: 'sendwave',    name: 'Sendwave',      margin: -2.0018, color: '#34d399', type: 'receiving', active: true },
  { corridor: 'NGN-EUR', platform_id: 'wise',        name: 'Wise',          margin: -2.6388, color: '#4ade80', type: 'receiving', active: true },
  { corridor: 'NGN-EUR', platform_id: 'remitly',     name: 'Remitly',       margin: -3.2757, color: '#f87171', type: 'receiving', active: true },
  { corridor: 'NGN-EUR', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -4.3676, color: '#a78bfa', type: 'receiving', active: true },
  { corridor: 'NGN-EUR', platform_id: 'westernunion',name: 'Western Union', margin: -5.7325, color: '#fbbf24', type: 'receiving', active: true },
  // GHS → EUR
  { corridor: 'GHS-EUR', platform_id: 'lemfi',       name: 'LemFi',         margin: -1.4040, color: '#f59e0b', type: 'receiving', active: true },
  { corridor: 'GHS-EUR', platform_id: 'sendwave',    name: 'Sendwave',      margin: -1.7160, color: '#34d399', type: 'receiving', active: true },
  { corridor: 'GHS-EUR', platform_id: 'wise',        name: 'Wise',          margin: -2.2622, color: '#4ade80', type: 'receiving', active: true },
  { corridor: 'GHS-EUR', platform_id: 'remitly',     name: 'Remitly',       margin: -2.8862, color: '#f87171', type: 'receiving', active: true },
  { corridor: 'GHS-EUR', platform_id: 'worldremit',  name: 'WorldRemit',    margin: -3.9782, color: '#a78bfa', type: 'receiving', active: true },
  { corridor: 'GHS-EUR', platform_id: 'westernunion',name: 'Western Union', margin: -5.2262, color: '#fbbf24', type: 'receiving', active: true },
]
