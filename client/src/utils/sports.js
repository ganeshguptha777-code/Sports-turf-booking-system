export const SPORT_IMAGES = {
  Football:
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1000&q=80',
  Tennis:
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
  Basketball:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80',
  Badminton:
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80',
  Cricket:
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80',
  Pickleball:
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
  Padel:
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80',
};

export const SPORTS = [
  { name: 'Football', label: 'Football', blurb: '5-a-side to 11-a-side' },
  { name: 'Tennis', label: 'Tennis', blurb: 'Hard, clay & synthetic' },
  { name: 'Basketball', label: 'Basketball', blurb: 'Full court & half court' },
  { name: 'Badminton', label: 'Badminton', blurb: 'Indoor wooden courts' },
  { name: 'Cricket', label: 'Cricket', blurb: 'Nets & match grounds' },
];

export function sportsImage(sport) {
  return SPORT_IMAGES[sport] || '/court-placeholder.svg';
}
