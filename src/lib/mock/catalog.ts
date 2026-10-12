import type { Addon, Category, Crust, PizzaSize, Product, Promotion, Topping } from "@/lib/types";
import { PHOTOS } from "@/lib/images";

export const CATEGORIES: Category[] = [
  { id: "cat_classic", name: "Classic Pizzas", slug: "classic", description: "Timeless Neapolitan favourites", image: PHOTOS.margherita, sortOrder: 1, enabled: true },
  { id: "cat_signature", name: "Signature Pizzas", slug: "signature", description: "Our chefs' house creations", image: PHOTOS.bellaSpecial, sortOrder: 2, enabled: true },
  { id: "cat_premium", name: "Premium Pizzas", slug: "premium", description: "Truffle, burrata & Parma ham", image: PHOTOS.prosciutto, sortOrder: 3, enabled: true },
  { id: "cat_veg", name: "Vegetarian Pizzas", slug: "vegetarian", description: "Garden-fresh and meat-free", image: PHOTOS.florentine, sortOrder: 4, enabled: true },
  { id: "cat_sides", name: "Sides", slug: "sides", description: "Flatbreads, wings & fries", image: PHOTOS.garlicBread, sortOrder: 5, enabled: true },
  { id: "cat_drinks", name: "Drinks", slug: "drinks", description: "Lemonades & sparkling", image: PHOTOS.lemonade, sortOrder: 6, enabled: true },
  { id: "cat_desserts", name: "Desserts", slug: "desserts", description: "Tiramisu, gelato & more", image: PHOTOS.tiramisu, sortOrder: 7, enabled: true },
  { id: "cat_deals", name: "Special Deals", slug: "deals", description: "Bundles that save you more", image: PHOTOS.partySlices, sortOrder: 8, enabled: true },
];

export const CRUSTS: Crust[] = [
  { id: "crust_classic", name: "Classic Hand-Tossed", description: "Soft, airy, 48-hour dough", price: 0 },
  { id: "crust_thin", name: "Thin & Crispy", description: "Roman-style, extra crunch", price: 0 },
  { id: "crust_napoli", name: "Neapolitan Wood-Fired", description: "Leopard-spotted cornicione", price: 1.5 },
  { id: "crust_stuffed", name: "Stuffed Cheese Crust", description: "Mozzarella-filled edge", price: 3 },
  { id: "crust_gf", name: "Gluten-Free", description: "Cauliflower & rice flour", price: 3.5 },
];

export const TOPPINGS: Topping[] = [
  { id: "top_mozz", name: "Extra Mozzarella", price: 1.75, veg: true, available: true },
  { id: "top_pepperoni", name: "Pepperoni", price: 2, veg: false, available: true },
  { id: "top_sausage", name: "Italian Sausage", price: 2.25, veg: false, available: true },
  { id: "top_prosciutto", name: "Prosciutto di Parma", price: 3, veg: false, available: true },
  { id: "top_nduja", name: "Spicy 'Nduja", price: 2.75, veg: false, available: true },
  { id: "top_chicken", name: "Grilled Chicken", price: 2.5, veg: false, available: true },
  { id: "top_mushroom", name: "Wild Mushrooms", price: 1.25, veg: true, available: true },
  { id: "top_onion", name: "Red Onion", price: 1, veg: true, available: true },
  { id: "top_peppers", name: "Roasted Peppers", price: 1.25, veg: true, available: true },
  { id: "top_olives", name: "Kalamata Olives", price: 1.25, veg: true, available: true },
  { id: "top_jalapeno", name: "Jalapeños", price: 1, veg: true, available: true },
  { id: "top_basil", name: "Fresh Basil", price: 0.75, veg: true, available: true },
  { id: "top_burrata", name: "Burrata", price: 3.5, veg: true, available: true },
  { id: "top_truffle", name: "Truffle Oil", price: 2.5, veg: true, available: true },
  { id: "top_honey", name: "Hot Honey Drizzle", price: 1.5, veg: true, available: true },
  { id: "top_rocket", name: "Wild Rocket", price: 1, veg: true, available: true },
];

export const ADDONS: Addon[] = [
  { id: "add_garlic", name: "Garlic & Herb Dip", price: 0.99, available: true },
  { id: "add_ranch", name: "Buttermilk Ranch Dip", price: 0.99, available: true },
  { id: "add_chili", name: "Calabrian Chili Oil", price: 1.25, available: true },
  { id: "add_parm", name: "Parmigiano Shavings", price: 1.5, available: true },
  { id: "add_cutlery", name: "Cutlery & Napkins", price: 0, available: true },
];

const ALL_TOPPINGS = TOPPINGS.map((t) => t.id);
const VEG_TOPPINGS = TOPPINGS.filter((t) => t.veg).map((t) => t.id);
const PIZZA_ADDONS = ["add_garlic", "add_ranch", "add_chili", "add_parm", "add_cutlery"];
const SIDE_ADDONS = ["add_garlic", "add_ranch", "add_chili"];

function sizes(small: number): PizzaSize[] {
  return [
    { id: "size_s", label: "Small", inches: 10, price: small },
    { id: "size_m", label: "Medium", inches: 12, price: +(small + 4).toFixed(2) },
    { id: "size_l", label: "Large", inches: 14, price: +(small + 7.5).toFixed(2) },
    { id: "size_xl", label: "Family", inches: 16, price: +(small + 10.5).toFixed(2) },
  ];
}

type Seed = Omit<Product, "sizes" | "toppingIds" | "addonIds" | "kind" | "featured" | "bestSeller" | "tags" | "available"> &
  Partial<Pick<Product, "featured" | "bestSeller" | "tags" | "available" | "toppingIds" | "addonIds">>;

function pizza(p: Seed): Product {
  return {
    kind: "pizza",
    sizes: sizes(p.price),
    toppingIds: p.toppingIds ?? (p.tags?.includes("veg") ? VEG_TOPPINGS : ALL_TOPPINGS),
    addonIds: p.addonIds ?? PIZZA_ADDONS,
    featured: false,
    bestSeller: false,
    tags: [],
    available: true,
    ...p,
  };
}

function item(p: Seed): Product {
  return {
    kind: "item",
    sizes: [],
    toppingIds: [],
    addonIds: p.addonIds ?? [],
    featured: false,
    bestSeller: false,
    tags: [],
    available: true,
    ...p,
  };
}

export const PRODUCTS: Product[] = [
  // Classic
  pizza({ id: "prd_margherita", slug: "margherita-classica", name: "Margherita Classica", categoryId: "cat_classic", image: PHOTOS.margherita, price: 11.5, description: "San Marzano tomato, fior di latte mozzarella, fresh basil and a ribbon of Sicilian extra-virgin olive oil. Simple, perfect, Neapolitan.", tags: ["veg"], featured: true, bestSeller: true, rating: 4.9, reviewCount: 1284, calories: 720, popularity: 10 }),
  pizza({ id: "prd_pepperoni", slug: "classic-pepperoni", name: "Classic Pepperoni", categoryId: "cat_classic", image: PHOTOS.pepperoni, price: 12.5, description: "Cup-and-char pepperoni over our slow-cooked tomato sauce and a generous blanket of low-moisture mozzarella.", featured: true, bestSeller: true, rating: 4.8, reviewCount: 1102, calories: 860, popularity: 10 }),
  pizza({ id: "prd_quattro", slug: "quattro-formaggi", name: "Quattro Formaggi", categoryId: "cat_classic", image: PHOTOS.quattroFormaggi, price: 13.5, description: "Mozzarella, gorgonzola dolce, fontina and aged parmigiano on a garlic cream base, finished with rosemary.", tags: ["veg"], rating: 4.7, reviewCount: 642, calories: 910, popularity: 6 }),
  pizza({ id: "prd_capricciosa", slug: "capricciosa", name: "Capricciosa", categoryId: "cat_classic", image: PHOTOS.capricciosa, price: 14, description: "Roast ham, wild mushrooms, artichoke hearts, olives and mozzarella — the Neapolitan everything pizza.", rating: 4.6, reviewCount: 488, calories: 880, popularity: 5 }),
  pizza({ id: "prd_diavola", slug: "diavola", name: "Diavola", categoryId: "cat_classic", image: PHOTOS.diavola, price: 13.5, description: "Spicy salami, Calabrian chillies, black olives and mozzarella over San Marzano tomato. Bring the heat.", tags: ["spicy"], bestSeller: true, rating: 4.8, reviewCount: 917, calories: 870, popularity: 8 }),
  // Signature
  pizza({ id: "prd_special", slug: "bella-napoli-special", name: "Bella Napoli Special", categoryId: "cat_signature", image: PHOTOS.bellaSpecial, price: 16, description: "Our house pizza: fennel sausage, roasted peppers, red onion, mushrooms and smoked provola, finished with basil oil.", tags: ["chef"], featured: true, bestSeller: true, rating: 4.9, reviewCount: 1356, calories: 940, popularity: 9 }),
  pizza({ id: "prd_nduja", slug: "nduja-hot-honey", name: "'Nduja & Hot Honey", categoryId: "cat_signature", image: PHOTOS.pepperoniOlive, price: 16.5, description: "Spreadable Calabrian 'nduja, pepperoni cups, Kalamata olives and a hot honey drizzle. Sweet, smoky, fiery.", tags: ["spicy", "new"], featured: true, rating: 4.9, reviewCount: 534, calories: 920, popularity: 8 }),
  pizza({ id: "prd_bbq", slug: "smoky-bbq-chicken", name: "Smoky BBQ Chicken", categoryId: "cat_signature", image: PHOTOS.bbqChicken, price: 15.5, description: "Grilled chicken, hickory BBQ base, red onion, sweet peppers, coriander and smoked mozzarella.", rating: 4.6, reviewCount: 611, calories: 900, popularity: 6 }),
  pizza({ id: "prd_meatfeast", slug: "meat-feast-inferno", name: "Meat Feast Inferno", categoryId: "cat_signature", image: PHOTOS.meatFeast, price: 16.5, description: "Pepperoni, Italian sausage, spicy salami and pulled beef with jalapeños and chili oil. Not for the faint-hearted.", tags: ["spicy"], rating: 4.7, reviewCount: 402, calories: 1080, popularity: 5 }),
  pizza({ id: "prd_detroit", slug: "detroit-deep-pan", name: "Detroit Deep Pan", categoryId: "cat_signature", image: PHOTOS.deepDish, price: 17, description: "Square, deep-pan crust with caramelised cheese edges, pepperoni and stripes of chunky tomato sauce.", tags: ["new"], rating: 4.7, reviewCount: 214, calories: 1120, popularity: 4 }),
  // Premium
  pizza({ id: "prd_truffle", slug: "truffle-funghi-bianca", name: "Truffle Funghi Bianca", categoryId: "cat_premium", image: PHOTOS.truffleFunghi, price: 19, description: "White pizza with wild mushrooms, fior di latte, taleggio, thyme and black truffle oil, shaved parmigiano.", tags: ["veg", "chef"], featured: true, rating: 4.9, reviewCount: 708, calories: 860, popularity: 7 }),
  pizza({ id: "prd_prosciutto", slug: "prosciutto-rocket", name: "Prosciutto & Rocket", categoryId: "cat_premium", image: PHOTOS.prosciutto, price: 19.5, description: "24-month Prosciutto di Parma, wild rocket, cherry tomatoes and parmigiano, laid over mozzarella after the bake.", bestSeller: true, rating: 4.8, reviewCount: 823, calories: 820, popularity: 7 }),
  pizza({ id: "prd_burrata", slug: "burrata-margherita", name: "Burrata Margherita DOP", categoryId: "cat_premium", image: PHOTOS.burrataMargherita, price: 18.5, description: "Our Margherita crowned with a whole Puglian burrata, torn basil and cracked black pepper.", tags: ["veg"], featured: true, rating: 4.9, reviewCount: 590, calories: 940, popularity: 6 }),
  pizza({ id: "prd_provola", slug: "smoked-provola-sausage", name: "Smoked Provola & Sausage", categoryId: "cat_premium", image: PHOTOS.provolaSausage, price: 18, description: "Fennel sausage, friarielli greens and smoked provola — the Naples street-food classic.", rating: 4.7, reviewCount: 311, calories: 960, popularity: 4 }),
  // Vegetarian
  pizza({ id: "prd_fresca", slug: "garden-fresca", name: "Garden Fresca", categoryId: "cat_veg", image: PHOTOS.gardenFresca, price: 13.5, description: "Heirloom tomatoes, roasted peppers, red onion, mushrooms, olives and basil on a tomato base.", tags: ["veg"], rating: 4.6, reviewCount: 377, calories: 690, popularity: 5 }),
  pizza({ id: "prd_florentine", slug: "florentine-spinach-ricotta", name: "Florentine Spinach & Ricotta", categoryId: "cat_veg", image: PHOTOS.florentine, price: 14, description: "Garlic spinach, whipped ricotta, mozzarella and lemon zest with a crack of black pepper.", tags: ["veg"], rating: 4.7, reviewCount: 296, calories: 740, popularity: 4 }),
  pizza({ id: "prd_caprese", slug: "caprese-thin", name: "Caprese Thin", categoryId: "cat_veg", image: PHOTOS.caprese, price: 14, description: "Thin, crisp base with cherry tomatoes, fior di latte, basil pesto and aged balsamic.", tags: ["veg"], rating: 4.6, reviewCount: 255, calories: 650, popularity: 4 }),
  pizza({ id: "prd_bianca_greens", slug: "ricotta-wild-greens", name: "Ricotta & Wild Greens", categoryId: "cat_veg", image: PHOTOS.ricottaGreens, price: 14.5, description: "Seasonal wild greens, ricotta, garlic confit and chili flakes on a white base. Limited daily batch.", tags: ["veg"], available: false, rating: 4.5, reviewCount: 118, calories: 680, popularity: 2 }),
  // Sides
  item({ id: "prd_garlicbread", slug: "garlic-butter-flatbread", name: "Garlic Butter Flatbread", categoryId: "cat_sides", image: PHOTOS.garlicBread, price: 6.5, description: "Wood-fired flatbread brushed with roasted garlic butter, parsley and sea salt.", tags: ["veg"], bestSeller: true, addonIds: SIDE_ADDONS, rating: 4.8, reviewCount: 940, calories: 420, popularity: 9 }),
  item({ id: "prd_chiliwings", slug: "calabrian-chili-wings", name: "Calabrian Chili Wings", categoryId: "cat_sides", image: PHOTOS.chiliWings, price: 10.5, description: "Eight crispy wings tossed in Calabrian chili glaze, served with ranch.", tags: ["spicy"], addonIds: SIDE_ADDONS, rating: 4.7, reviewCount: 512, calories: 690, popularity: 6 }),
  item({ id: "prd_bbqwings", slug: "smoky-bbq-wings", name: "Smoky BBQ Wings", categoryId: "cat_sides", image: PHOTOS.bbqWings, price: 10.5, description: "Oven-roasted wings lacquered in hickory BBQ with a cooling garlic dip.", addonIds: SIDE_ADDONS, rating: 4.6, reviewCount: 344, calories: 710, popularity: 4 }),
  item({ id: "prd_fries", slug: "parmesan-truffle-fries", name: "Parmesan Truffle Fries", categoryId: "cat_sides", image: PHOTOS.truffleFries, price: 6, description: "Skin-on fries with truffle oil, parmigiano and rosemary salt.", tags: ["veg"], addonIds: SIDE_ADDONS, rating: 4.7, reviewCount: 488, calories: 520, popularity: 6 }),
  item({ id: "prd_salad", slug: "tuscan-garden-salad", name: "Tuscan Garden Salad", categoryId: "cat_sides", image: PHOTOS.gardenSalad, price: 8.5, description: "Crisp leaves, cherry tomatoes, chickpeas, avocado and lemon-herb vinaigrette.", tags: ["veg"], rating: 4.5, reviewCount: 201, calories: 340, popularity: 3 }),
  // Drinks
  item({ id: "prd_lemonade", slug: "sicilian-lemonade", name: "Sicilian Lemonade", categoryId: "cat_drinks", image: PHOTOS.lemonade, price: 4.5, description: "Freshly squeezed Sicilian lemons, mint and a touch of cane sugar. 400ml.", tags: ["veg"], bestSeller: true, rating: 4.8, reviewCount: 402, calories: 140, popularity: 7 }),
  item({ id: "prd_spritz", slug: "blood-orange-spritz", name: "Blood Orange Spritz 0%", categoryId: "cat_drinks", image: PHOTOS.spritz, price: 5.5, description: "Alcohol-free bitter orange aperitivo, sparkling water and a slice of blood orange.", tags: ["veg", "new"], rating: 4.6, reviewCount: 133, calories: 90, popularity: 4 }),
  item({ id: "prd_water", slug: "still-mineral-water", name: "Still Mineral Water", categoryId: "cat_drinks", image: PHOTOS.water, price: 2.5, description: "Italian spring water. 500ml.", tags: ["veg"], rating: 4.5, reviewCount: 88, calories: 0, popularity: 3 }),
  // Desserts
  item({ id: "prd_tiramisu", slug: "classic-tiramisu", name: "Classic Tiramisu", categoryId: "cat_desserts", image: PHOTOS.tiramisu, price: 7, description: "Espresso-soaked savoiardi, whipped mascarpone and bitter cocoa — Nonna's recipe.", tags: ["veg"], bestSeller: true, rating: 4.9, reviewCount: 766, calories: 450, popularity: 7 }),
  item({ id: "prd_affogato", slug: "gelato-affogato", name: "Gelato Affogato", categoryId: "cat_desserts", image: PHOTOS.affogato, price: 6.5, description: "Fior di latte gelato drowned in a shot of espresso and salted caramel.", tags: ["veg"], rating: 4.7, reviewCount: 241, calories: 320, popularity: 4 }),
  item({ id: "prd_pannacotta", slug: "berry-panna-cotta", name: "Berry Panna Cotta", categoryId: "cat_desserts", image: PHOTOS.pannaCotta, price: 6.5, description: "Vanilla bean panna cotta with macerated strawberries.", tags: ["veg"], rating: 4.6, reviewCount: 187, calories: 380, popularity: 3 }),
  item({ id: "prd_brownie", slug: "chocolate-fudge-brownie", name: "Chocolate Fudge Brownie", categoryId: "cat_desserts", image: PHOTOS.brownie, price: 6, description: "Warm, gooey dark-chocolate brownie with a pinch of sea salt.", tags: ["veg"], rating: 4.7, reviewCount: 298, calories: 480, popularity: 4 }),
  // Deals
  item({ id: "prd_family", slug: "family-feast", name: "Family Feast", categoryId: "cat_deals", image: PHOTOS.partySlices, price: 39.99, description: "Any 2 large classic pizzas, garlic butter flatbread and 2 Sicilian lemonades. Save over $12.", featured: true, rating: 4.8, reviewCount: 455, popularity: 6 }),
  item({ id: "prd_datenight", slug: "date-night-for-two", name: "Date Night for Two", categoryId: "cat_deals", image: PHOTOS.slicePull, price: 29.99, description: "One premium pizza, Tuscan garden salad and a tiramisu to share.", rating: 4.8, reviewCount: 212, popularity: 4 }),
  item({ id: "prd_lunch", slug: "lunch-slice-combo", name: "Lunch Slice Combo", categoryId: "cat_deals", image: PHOTOS.pepperoniSlice, price: 11.99, description: "Small classic pizza with a drink of your choice. Weekdays 11am–3pm.", rating: 4.6, reviewCount: 380, popularity: 5 }),
  item({ id: "prd_gamenight", slug: "game-night-bundle", name: "Game Night Bundle", categoryId: "cat_deals", image: PHOTOS.cheesePull, price: 49.99, description: "3 large pizzas, 16 wings and truffle fries — built for the big match.", tags: ["new"], rating: 4.7, reviewCount: 97, popularity: 3 }),
];

export const PROMOTIONS: Promotion[] = [
  { id: "promo_welcome", code: "WELCOME10", title: "10% off your order", description: "Welcome to Bella Napoli — enjoy 10% off any order.", type: "percent", value: 10, minSubtotal: 0, active: true },
  { id: "promo_pizza20", code: "PIZZA20", title: "20% off orders over $40", description: "Feeding a crowd? Take 20% off when you spend $40 or more.", type: "percent", value: 20, minSubtotal: 40, active: true },
  { id: "promo_freedel", code: "FREEDEL", title: "Free delivery", description: "Free delivery on orders over $25.", type: "free_delivery", value: 0, minSubtotal: 25, active: true },
  { id: "promo_bella5", code: "BELLA5", title: "$5 off", description: "$5 off orders over $30.", type: "fixed", value: 5, minSubtotal: 30, active: true },
];
