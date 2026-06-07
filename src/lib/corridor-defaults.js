// Canonical platform defaults — source of truth for seeding and fallback.
// Rates start as null and are set manually via the admin dashboard.

export const DEFAULT_PLATFORMS = [
  // GBP → NGN
  { corridor: 'GBP-NGN', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-NGN', platform_id: 'sendapp',     name: 'SendApp',       color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-NGN', platform_id: 'africhange',  name: 'Africhange',    color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-NGN', platform_id: 'pesa',        name: 'Pesa',          color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-NGN', platform_id: 'raenest',     name: 'Raenest',       color: '#60a5fa', active: true, sending_rate: null, receiving_rate: null },
  // GBP → GHS
  { corridor: 'GBP-GHS', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-GHS', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-GHS', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-GHS', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-GHS', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GBP-GHS', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // EUR → NGN
  { corridor: 'EUR-NGN', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-NGN', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-NGN', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-NGN', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-NGN', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-NGN', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // EUR → GHS
  { corridor: 'EUR-GHS', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-GHS', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-GHS', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-GHS', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-GHS', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'EUR-GHS', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // NGN → GBP
  { corridor: 'NGN-GBP', platform_id: 'sendapp',     name: 'SendApp',       color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-GBP', platform_id: 'africhange',  name: 'Africhange',    color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-GBP', platform_id: 'raenest',     name: 'Raenest',       color: '#60a5fa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-GBP', platform_id: 'pesa',        name: 'Pesa',          color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-GBP', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  // GHS → GBP
  { corridor: 'GHS-GBP', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-GBP', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-GBP', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-GBP', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-GBP', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-GBP', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // NGN → EUR
  { corridor: 'NGN-EUR', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-EUR', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-EUR', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-EUR', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-EUR', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-EUR', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // GHS → EUR
  { corridor: 'GHS-EUR', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-EUR', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-EUR', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-EUR', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-EUR', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-EUR', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // USD → NGN
  { corridor: 'USD-NGN', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-NGN', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-NGN', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-NGN', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-NGN', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-NGN', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // USD → GHS
  { corridor: 'USD-GHS', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-GHS', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-GHS', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-GHS', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-GHS', platform_id: 'sendwave',    name: 'Sendwave',      color: '#34d399', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'USD-GHS', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // NGN → USD
  { corridor: 'NGN-USD', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-USD', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-USD', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-USD', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'NGN-USD', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
  // GHS → USD
  { corridor: 'GHS-USD', platform_id: 'wise',        name: 'Wise',          color: '#4ade80', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-USD', platform_id: 'lemfi',       name: 'LemFi',         color: '#f59e0b', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-USD', platform_id: 'remitly',     name: 'Remitly',       color: '#f87171', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-USD', platform_id: 'worldremit',  name: 'WorldRemit',    color: '#a78bfa', active: true, sending_rate: null, receiving_rate: null },
  { corridor: 'GHS-USD', platform_id: 'westernunion',name: 'Western Union', color: '#fbbf24', active: true, sending_rate: null, receiving_rate: null },
]
