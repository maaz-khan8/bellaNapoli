/** Build a cropped Unsplash URL. next/image adds its own width when optimising. */
export function unsplash(id: string, width = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Curated, verified photography used across the prototype. */
export const PHOTOS = {
  quattroFormaggi: unsplash("1513104890138-7c749659a591"),
  bbqChicken: unsplash("1565299624946-b28f40a0ae38"),
  burrataMargherita: unsplash("1574071318508-1cdbab80d002"),
  meatFeast: unsplash("1594007654729-407eedc4be65"),
  diavola: unsplash("1604382354936-07c5d9983bd3"),
  sharing: unsplash("1571407970349-bc81e7e96d47"),
  gardenFresca: unsplash("1590947132387-155cc02f3212"),
  pepperoni: unsplash("1628840042765-356cda07504e"),
  margherita: unsplash("1595854341625-f33ee10dbf94"),
  ricottaGreens: unsplash("1511689660979-10d2b1aada49"),
  cheesePizza: unsplash("1548369937-47519962c11a"),
  florentine: unsplash("1593560708920-61dd98c46a4e"),
  margheritaSlice: unsplash("1600028068383-ea11a7a101f3"),
  woodOven: unsplash("1579751626657-72bc17010498", 1600),
  truffleFunghi: unsplash("1555072956-7758afb20e8f"),
  caprese: unsplash("1585238342024-78d387f4a707"),
  provolaSausage: unsplash("1588315029754-2dd089d39a1a"),
  garlicBread: unsplash("1619535860434-ba1d8fa12536"),
  chiliWings: unsplash("1608039755401-742074f0548d"),
  truffleFries: unsplash("1573080496219-bb080dd4f877"),
  gardenSalad: unsplash("1512621776951-a57141f2eefd"),
  bbqWings: unsplash("1527477396000-e27163b481c2"),
  spritz: unsplash("1544145945-f90425340c7e"),
  lemonade: unsplash("1621263764928-df1444c5e859"),
  water: unsplash("1523362628745-0c100150b504"),
  tiramisu: unsplash("1571877227200-a0d98ea607e9"),
  affogato: unsplash("1551024506-0bccd828d307"),
  pannaCotta: unsplash("1488477181946-6428a0291777"),
  brownie: unsplash("1606313564200-e75d5e30476c"),
  interior: unsplash("1517248135467-4c7edcad34c4", 1400),
  interiorBright: unsplash("1555396273-367ea4eb4db5", 1400),
  pepperoniHero: unsplash("1534308983496-4fabb1a015ee", 1400),
  pepperoniOlive: unsplash("1458642849426-cfb724f15ef7"),
  bellaSpecial: unsplash("1576458088443-04a19bb13da6"),
  partySlices: unsplash("1601924582970-9238bcb495d9"),
  cheesePull: unsplash("1520201163981-8cc95007dd2a", 1400),
  slicePull: unsplash("1541745537411-b8046dc6d66c", 1400),
  capricciosa: unsplash("1552539618-7eec9b4d1796"),
  prosciutto: unsplash("1600628421055-4d30de868b8f"),
  pepperoniSlice: unsplash("1566843972142-a7fcb70de55a"),
  brownies: unsplash("1564355808539-22fda35bed7e"),
  deepDish: unsplash("1574126154517-d1e0d89ef734"),
} as const;

/** Images offered in the manager's image picker */
export const IMAGE_LIBRARY: { label: string; url: string }[] = Object.entries(PHOTOS).map(
  ([key, url]) => ({
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
    url,
  }),
);
