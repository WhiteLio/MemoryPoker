export const MAX_SEED = 142856;
export const DIFFICULTIES = [
  'Monday · 8 cards · columns',
  'Tuesday · 12 cards · columns',
  'Wednesday · 12 cards · diagonals',
  'Thursday · 12 cards · shuffled',
  'Friday · 16 cards · shuffled',
  'Saturday · 16 cards · strict shuffle',
  'Sunday · 16 cards · columns / diagonals'
];
// Each seed selects one complete generated week, preserving the daily v1 generator.
export function endlessNumber(profile, seed) {
  if(!Number.isInteger(profile)||profile<0||profile>6||!Number.isInteger(seed)||seed<1||seed>MAX_SEED) throw new Error('Invalid endless deal');
  return (seed-1)*7+profile+1;
}
export function endlessSettings(search) {
  const params=new URLSearchParams(search);
  const profile=Number(params.get('difficulty')??0), seed=Number(params.get('seed')??1);
  try {endlessNumber(profile,seed);return {profile,seed};} catch {return {profile:0,seed:1};}
}
