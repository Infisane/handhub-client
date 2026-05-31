export interface Review {
  stars: number
  text: string
  by: string
}

export interface Artisan {
  id: number
  name: string
  role: string
  loc: string
  dist: string
  initials: string
  avatarIndex: number
  rate: number
  rating: number
  jobs: number
  avail: 'now' | 'sched'
  tags: string[]
  bio: string
  reviews: Review[]
}

export const AVATAR_COLORS: Record<number, { bg: string; color: string }> = {
  1:  { bg: '#3D1F0D', color: '#F97316' },
  2:  { bg: '#0D2333', color: '#38BDF8' },
  3:  { bg: '#0D2D1A', color: '#4ADE80' },
  4:  { bg: '#2A0D2D', color: '#C084FC' },
  5:  { bg: '#2D2209', color: '#FBBF24' },
  6:  { bg: '#1A0D2D', color: '#818CF8' },
  7:  { bg: '#0D2626', color: '#2DD4BF' },
  8:  { bg: '#2D0D0D', color: '#F87171' },
  9:  { bg: '#1F2D0D', color: '#86EFAC' },
  10: { bg: '#2D1A0D', color: '#FB923C' },
}

export const ARTISANS: Artisan[] = [
  {
    id: 1, name: 'Taiwo Johnson', role: 'Licensed Electrician', loc: 'Ikeja, Lagos',
    dist: '1.2km', initials: 'TJ', avatarIndex: 1, rate: 8500, rating: 4.9, jobs: 83, avail: 'now',
    tags: ['Residential', 'Emergency', 'Panels'],
    bio: '10 years experience in residential and commercial electrical works. Specialises in panel upgrades and emergency faults.',
    reviews: [
      { stars: 5, text: 'Fixed my tripped breaker in under an hour. Professional and clean.', by: 'Adeola K.' },
      { stars: 5, text: 'Quick response at midnight. Truly reliable.', by: 'Bode A.' },
    ],
  },
  {
    id: 2, name: 'Emeka Nwosu', role: 'Master Plumber', loc: 'Yaba, Lagos',
    dist: '2.4km', initials: 'EN', avatarIndex: 2, rate: 7200, rating: 4.8, jobs: 61, avail: 'now',
    tags: ['Pipes', 'Drainage', 'Emergency'],
    bio: 'Certified master plumber with expertise in both residential and commercial plumbing installations.',
    reviews: [
      { stars: 5, text: 'Sorted my leaking pipes quickly. Would hire again.', by: 'Chidi O.' },
      { stars: 4, text: 'Good work, arrived on time.', by: 'Fatima B.' },
    ],
  },
  {
    id: 3, name: 'Fatima Abubakar', role: 'Carpenter', loc: 'Surulere, Lagos',
    dist: '3.1km', initials: 'FA', avatarIndex: 3, rate: 6000, rating: 4.7, jobs: 45, avail: 'sched',
    tags: ['Furniture', 'Framing', 'Doors'],
    bio: 'Skilled carpenter specialising in custom furniture, door fittings, and structural woodwork.',
    reviews: [
      { stars: 5, text: 'Made a beautiful wardrobe exactly to my specs.', by: 'Ngozi C.' },
      { stars: 4, text: 'Quality work but took slightly longer than estimated.', by: 'Seun A.' },
    ],
  },
  {
    id: 4, name: 'Biodun Kareem', role: 'AC Technician', loc: 'VI, Lagos',
    dist: '3.8km', initials: 'BK', avatarIndex: 4, rate: 9000, rating: 4.9, jobs: 102, avail: 'now',
    tags: ['Installation', 'Servicing', 'Emergency'],
    bio: 'Top-rated AC technician serving Victoria Island and Lekki. Handles all major brands.',
    reviews: [
      { stars: 5, text: 'Serviced 3 units in one visit. Very thorough.', by: 'Amaka I.' },
      { stars: 5, text: 'Fixed my AC in 45 mins. Worth every naira.', by: 'Tunde F.' },
    ],
  },
  {
    id: 5, name: 'Rasheed Okafor', role: 'Painter', loc: 'Lekki, Lagos',
    dist: '4.2km', initials: 'RO', avatarIndex: 5, rate: 5500, rating: 4.6, jobs: 37, avail: 'sched',
    tags: ['Interior', 'Exterior', 'Texture'],
    bio: 'Professional painter with expertise in interior and exterior finishes, texture coatings, and commercial painting.',
    reviews: [
      { stars: 5, text: 'Transformed my living room. Excellent finish.', by: 'Kemi L.' },
      { stars: 4, text: 'Good painter, very tidy.', by: 'Yemi B.' },
    ],
  },
  {
    id: 6, name: 'Chiamaka Eze', role: 'Tiler', loc: 'Ikeja, Lagos',
    dist: '1.9km', initials: 'CE', avatarIndex: 6, rate: 7800, rating: 4.8, jobs: 54, avail: 'now',
    tags: ['Floor', 'Wall', 'Outdoor'],
    bio: 'Specialist tiler with 8 years experience. Works with all tile types including marble, porcelain, and ceramic.',
    reviews: [
      { stars: 5, text: 'Laid my bathroom tiles perfectly. Zero grout issues.', by: 'Dele M.' },
      { stars: 5, text: 'Super professional. Floor looks amazing.', by: 'Sola K.' },
    ],
  },
  {
    id: 7, name: 'Musa Dangana', role: 'Welder', loc: 'Mushin, Lagos',
    dist: '5.1km', initials: 'MD', avatarIndex: 7, rate: 6500, rating: 4.5, jobs: 29, avail: 'sched',
    tags: ['Gates', 'Railings', 'Fabrication'],
    bio: 'Experienced welder and fabricator specialising in security gates, railings, and custom metalwork.',
    reviews: [
      { stars: 5, text: 'Built my gate exactly as designed. Strong work.', by: 'Hassan A.' },
      { stars: 4, text: 'Good welder. Finished ahead of schedule.', by: 'Ifeanyi O.' },
    ],
  },
  {
    id: 8, name: 'Kunle Adeyemi', role: 'Generator Technician', loc: 'Ikeja, Lagos',
    dist: '2.2km', initials: 'KA', avatarIndex: 8, rate: 8000, rating: 4.7, jobs: 68, avail: 'now',
    tags: ['Diagnosis', 'Repair', 'Inverters'],
    bio: 'Generator and inverter specialist. Services all brands including Mikano, Perkins, and Honda.',
    reviews: [
      { stars: 5, text: 'Diagnosed my gen fault in minutes. Very knowledgeable.', by: 'Tobi A.' },
      { stars: 5, text: 'Fixed my inverter same day. Highly recommend.', by: 'Bukky O.' },
    ],
  },
  {
    id: 9, name: 'Adaeze Obi', role: 'Electrician', loc: 'Lekki, Lagos',
    dist: '4.6km', initials: 'AO', avatarIndex: 9, rate: 7500, rating: 4.8, jobs: 41, avail: 'now',
    tags: ['Wiring', 'Lighting', 'Solar'],
    bio: 'Female electrician with expertise in smart home wiring, solar installations, and lighting design.',
    reviews: [
      { stars: 5, text: 'Installed my solar setup perfectly. Very professional.', by: 'Emeka S.' },
      { stars: 5, text: 'Fixed my wiring fault fast. Knowledgeable and clean.', by: 'Adaeze T.' },
    ],
  },
  {
    id: 10, name: 'Gbenga Oladipo', role: 'Plumber', loc: 'Surulere, Lagos',
    dist: '2.8km', initials: 'GO', avatarIndex: 10, rate: 6800, rating: 4.6, jobs: 33, avail: 'sched',
    tags: ['Boreholes', 'Pipes', 'Tanks'],
    bio: 'Experienced plumber specialising in borehole pumps, overhead tank installations, and pipe bursts.',
    reviews: [
      { stars: 4, text: 'Fixed my borehole pump efficiently.', by: 'Remi F.' },
      { stars: 5, text: 'Very professional, good price.', by: 'Ola B.' },
    ],
  },
]
