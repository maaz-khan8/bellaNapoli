import type { PlatformSettings, Restaurant } from "@/lib/types";
import { unsplash } from "@/lib/images";

/**
 * Single source of truth for Bella Napoli branding and business details.
 * The Restaurant Manager can edit these at runtime (persisted locally);
 * this file holds the defaults that "Reset Demo Data" restores.
 */
export const RESTAURANT_DEFAULTS: Restaurant = {
  id: "rest_bella_napoli",
  name: "Bella Napoli Pizza",
  tagline: "Wood-fired Neapolitan pizza, made by hand since 1998",
  description:
    "Bella Napoli is a family-run pizzeria bringing the soul of Naples to the neighbourhood. Our dough rests for 48 hours, our tomatoes come from the slopes of Mount Vesuvius, and every pizza is fired for ninety seconds in a 485°C wood oven built by hand.",
  logo: "",
  coverImage: unsplash("1579751626657-72bc17010498", 1600),
  address: "214 Mulberry Street",
  city: "New York, NY 10012",
  phone: "(212) 555-0147",
  email: "ciao@bellanapoli.demo",
  hours: [
    { day: "Monday", open: "11:00", close: "22:00", closed: false },
    { day: "Tuesday", open: "11:00", close: "22:00", closed: false },
    { day: "Wednesday", open: "11:00", close: "22:00", closed: false },
    { day: "Thursday", open: "11:00", close: "23:00", closed: false },
    { day: "Friday", open: "11:00", close: "00:00", closed: false },
    { day: "Saturday", open: "12:00", close: "00:00", closed: false },
    { day: "Sunday", open: "12:00", close: "21:30", closed: false },
  ],
  delivery: {
    enabled: true,
    fee: 3.99,
    freeDeliveryOver: 40,
    minOrder: 15,
    radiusKm: 6,
    estimatedMinutes: 35,
  },
  pickup: { enabled: true, estimatedMinutes: 20 },
  acceptingOrders: true,
  platformActive: true,
  approvalStatus: "approved",
  rating: 4.9,
  reviewCount: 2847,
  foundedYear: 1998,
  reviews: [
    {
      id: "rev_1",
      author: "Marcus T.",
      location: "SoHo",
      rating: 5,
      quote:
        "The crust is unreal — blistered, chewy, and light. The 'Nduja & Hot Honey has ruined every other pizza for me.",
      avatar: "MT",
    },
    {
      id: "rev_2",
      author: "Priya S.",
      location: "Little Italy",
      rating: 5,
      quote:
        "Ordered for a team lunch of twelve. Arrived early, still piping hot, and the tracking updates were spot on.",
      avatar: "PS",
    },
    {
      id: "rev_3",
      author: "Daniel K.",
      location: "Nolita",
      rating: 5,
      quote:
        "Truffle Funghi Bianca is the best white pizza in the city. The tiramisu is worth the trip on its own.",
      avatar: "DK",
    },
    {
      id: "rev_4",
      author: "Elena R.",
      location: "Tribeca",
      rating: 4,
      quote:
        "Beautiful Margherita, generous burrata, and the gluten-free crust is genuinely good. Rare find.",
      avatar: "ER",
    },
    {
      id: "rev_5",
      author: "Jordan L.",
      location: "Chinatown",
      rating: 5,
      quote:
        "Customising my pizza was so easy, and the price updated as I added toppings. No surprises at checkout.",
      avatar: "JL",
    },
  ],
};

export const PLATFORM_DEFAULTS: PlatformSettings = {
  platformName: "Crustline",
  supportEmail: "support@crustline.demo",
  commissionRate: 12,
};
