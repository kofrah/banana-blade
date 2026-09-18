export const RARE_BLADE_CHANCE=.1;
export function chooseRareBlade(random:()=>number=Math.random){return random()<RARE_BLADE_CHANCE}
export function flightCutRandom(random:()=>number=Math.random){return (random()-.5)/6}
