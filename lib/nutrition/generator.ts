import type { Goal, MealEntry, MealPlanContent, NutritionTargets } from "@/types";

/** Share of daily calories allocated to each meal slot. */
const MEAL_CALORIE_SHARE = {
  breakfast: 0.25,
  morningSnack: 0.1,
  lunch: 0.3,
  afternoonSnack: 0.1,
  dinner: 0.25,
} as const;

interface MealTemplate {
  name: string;
  nameAr: string;
  items: string[];
  /** Macro ratio for this specific template (protein/carb/fat share of ITS OWN calories). */
  ratio: { protein: number; carbs: number; fat: number };
}

const MEAL_LIBRARY: Record<Goal, Record<keyof typeof MEAL_CALORIE_SHARE, MealTemplate[]>> = {
  FAT_LOSS: {
    breakfast: [
      {
        name: "Egg white omelet with spinach & oats",
        nameAr: "أومليت بياض بيض مع السبانخ والشوفان",
        items: ["4 egg whites + 1 whole egg", "Handful spinach", "40g dry oats", "Black coffee/tea"],
        ratio: { protein: 0.35, carbs: 0.45, fat: 0.2 },
      },
      {
        name: "Greek yogurt with berries & almonds",
        nameAr: "زبادي يوناني مع التوت واللوز",
        items: ["250g low-fat Greek yogurt", "Handful mixed berries", "10 almonds", "1 tsp honey"],
        ratio: { protein: 0.4, carbs: 0.4, fat: 0.2 },
      },
    ],
    morningSnack: [
      {
        name: "Protein shake",
        nameAr: "مخفوق بروتين",
        items: ["1 scoop whey protein", "200ml water/almond milk"],
        ratio: { protein: 0.7, carbs: 0.2, fat: 0.1 },
      },
      {
        name: "Apple with cottage cheese",
        nameAr: "تفاح مع جبن قريش",
        items: ["1 medium apple", "100g cottage cheese"],
        ratio: { protein: 0.4, carbs: 0.5, fat: 0.1 },
      },
    ],
    lunch: [
      {
        name: "Grilled chicken breast, rice & salad",
        nameAr: "صدر دجاج مشوي مع الأرز والسلطة",
        items: ["150g grilled chicken breast", "80g dry rice (cooked)", "Large mixed salad", "1 tsp olive oil"],
        ratio: { protein: 0.4, carbs: 0.4, fat: 0.2 },
      },
      {
        name: "Baked white fish with sweet potato",
        nameAr: "سمك أبيض مشوي مع البطاطا الحلوة",
        items: ["180g white fish fillet", "150g sweet potato", "Steamed broccoli"],
        ratio: { protein: 0.4, carbs: 0.4, fat: 0.2 },
      },
    ],
    afternoonSnack: [
      {
        name: "Rice cakes with turkey slices",
        nameAr: "رقائق أرز مع شرائح ديك رومي",
        items: ["2 rice cakes", "60g sliced turkey breast"],
        ratio: { protein: 0.45, carbs: 0.4, fat: 0.15 },
      },
    ],
    dinner: [
      {
        name: "Lean beef stir-fry with vegetables",
        nameAr: "لحم بقري مشوي مع الخضار",
        items: ["150g lean beef strips", "Mixed stir-fry vegetables", "1 tsp sesame oil"],
        ratio: { protein: 0.4, carbs: 0.3, fat: 0.3 },
      },
      {
        name: "Grilled salmon with asparagus",
        nameAr: "سلمون مشوي مع الهليون",
        items: ["150g salmon fillet", "Grilled asparagus", "Lemon & herbs"],
        ratio: { protein: 0.4, carbs: 0.15, fat: 0.45 },
      },
    ],
  },
  MUSCLE_GAIN: {
    breakfast: [
      {
        name: "Oats, whey & peanut butter bowl",
        nameAr: "شوفان مع بروتين وزبدة الفول السوداني",
        items: ["80g dry oats", "1 scoop whey protein", "1 tbsp peanut butter", "1 banana"],
        ratio: { protein: 0.3, carbs: 0.5, fat: 0.2 },
      },
      {
        name: "Whole eggs with toast & avocado",
        nameAr: "بيض كامل مع توست وأفوكادو",
        items: ["3 whole eggs", "2 slices whole-grain toast", "Half avocado"],
        ratio: { protein: 0.3, carbs: 0.4, fat: 0.3 },
      },
    ],
    morningSnack: [
      {
        name: "Mass shake",
        nameAr: "مخفوق زيادة الوزن",
        items: ["1 scoop whey", "250ml whole milk", "1 tbsp oats", "1 tbsp honey"],
        ratio: { protein: 0.35, carbs: 0.45, fat: 0.2 },
      },
    ],
    lunch: [
      {
        name: "Chicken thighs, rice & vegetables",
        nameAr: "أفخاذ دجاج مع الأرز والخضار",
        items: ["200g chicken thighs", "150g dry rice (cooked)", "Sautéed vegetables", "1 tbsp olive oil"],
        ratio: { protein: 0.3, carbs: 0.45, fat: 0.25 },
      },
    ],
    afternoonSnack: [
      {
        name: "Trail mix & protein bar",
        nameAr: "مكسرات مشكلة وبروتين بار",
        items: ["30g mixed nuts", "1 protein bar"],
        ratio: { protein: 0.3, carbs: 0.4, fat: 0.3 },
      },
    ],
    dinner: [
      {
        name: "Beef, pasta & vegetables",
        nameAr: "لحم بقري مع المعكرونة والخضار",
        items: ["200g lean ground beef", "100g dry pasta (cooked)", "Tomato sauce", "Side salad"],
        ratio: { protein: 0.3, carbs: 0.45, fat: 0.25 },
      },
    ],
  },
  RECOMPOSITION: {
    breakfast: [
      {
        name: "Protein pancakes with berries",
        nameAr: "بان كيك بروتين مع التوت",
        items: ["1 scoop whey protein", "2 eggs", "40g oats", "Mixed berries"],
        ratio: { protein: 0.4, carbs: 0.4, fat: 0.2 },
      },
    ],
    morningSnack: [
      {
        name: "Cottage cheese & pineapple",
        nameAr: "جبن قريش مع الأناناس",
        items: ["150g cottage cheese", "100g pineapple chunks"],
        ratio: { protein: 0.45, carbs: 0.45, fat: 0.1 },
      },
    ],
    lunch: [
      {
        name: "Turkey breast, quinoa & greens",
        nameAr: "صدر ديك رومي مع الكينوا والخضار الورقية",
        items: ["180g turkey breast", "100g dry quinoa (cooked)", "Mixed greens", "1 tsp olive oil"],
        ratio: { protein: 0.4, carbs: 0.4, fat: 0.2 },
      },
    ],
    afternoonSnack: [
      {
        name: "Protein shake with almonds",
        nameAr: "مخفوق بروتين مع اللوز",
        items: ["1 scoop whey protein", "10 almonds"],
        ratio: { protein: 0.5, carbs: 0.2, fat: 0.3 },
      },
    ],
    dinner: [
      {
        name: "White fish, roasted vegetables",
        nameAr: "سمك أبيض مع الخضار المشوية",
        items: ["180g white fish", "Roasted mixed vegetables", "1 tsp olive oil"],
        ratio: { protein: 0.45, carbs: 0.3, fat: 0.25 },
      },
    ],
  },
  MAINTENANCE: {
    breakfast: [
      {
        name: "Balanced breakfast bowl",
        nameAr: "طبق فطور متوازن",
        items: ["2 eggs", "50g oats", "1 piece of fruit"],
        ratio: { protein: 0.3, carbs: 0.45, fat: 0.25 },
      },
    ],
    morningSnack: [
      {
        name: "Yogurt & granola",
        nameAr: "زبادي مع الغرانولا",
        items: ["150g yogurt", "30g granola"],
        ratio: { protein: 0.3, carbs: 0.5, fat: 0.2 },
      },
    ],
    lunch: [
      {
        name: "Grilled chicken & rice bowl",
        nameAr: "طبق دجاج مشوي مع الأرز",
        items: ["170g grilled chicken", "120g dry rice (cooked)", "Vegetables"],
        ratio: { protein: 0.35, carbs: 0.45, fat: 0.2 },
      },
    ],
    afternoonSnack: [
      {
        name: "Mixed nuts & fruit",
        nameAr: "مكسرات مشكلة وفاكهة",
        items: ["20g mixed nuts", "1 piece of fruit"],
        ratio: { protein: 0.15, carbs: 0.55, fat: 0.3 },
      },
    ],
    dinner: [
      {
        name: "Salmon, potatoes & greens",
        nameAr: "سلمون مع البطاطا والخضار الورقية",
        items: ["170g salmon", "150g potatoes", "Steamed greens"],
        ratio: { protein: 0.35, carbs: 0.35, fat: 0.3 },
      },
    ],
  },
};

const SUPPLEMENTS_BY_GOAL: Record<Goal, string[]> = {
  FAT_LOSS: ["Whey or plant protein isolate", "Multivitamin", "Omega-3 fish oil", "Green tea extract (optional)"],
  MUSCLE_GAIN: ["Whey protein / mass gainer", "Creatine monohydrate (5g/day)", "Multivitamin", "Omega-3 fish oil"],
  RECOMPOSITION: ["Whey protein", "Creatine monohydrate (5g/day)", "Multivitamin", "Vitamin D"],
  MAINTENANCE: ["Multivitamin", "Omega-3 fish oil"],
};

const ALTERNATIVES_BY_GOAL: Record<Goal, string[]> = {
  FAT_LOSS: [
    "Swap rice for cauliflower rice to cut ~100 kcal",
    "Swap chicken breast for turkey breast (similar macros)",
    "Swap oats for high-fiber cereal if needed",
  ],
  MUSCLE_GAIN: [
    "Swap rice for pasta or potatoes for variety",
    "Swap beef for lamb for extra calories",
    "Add a second scoop of oats to any meal to increase carbs",
  ],
  RECOMPOSITION: [
    "Swap turkey for chicken breast",
    "Swap quinoa for brown rice",
    "Swap cottage cheese for Greek yogurt",
  ],
  MAINTENANCE: ["Rotate protein sources weekly for variety", "Swap starches based on preference (rice/potato/pasta)"],
};

function scaleMeal(template: MealTemplate, calories: number): MealEntry {
  const proteinCalories = calories * template.ratio.protein;
  const carbsCalories = calories * template.ratio.carbs;
  const fatCalories = calories * template.ratio.fat;

  return {
    name: template.name,
    nameAr: template.nameAr,
    calories: Math.round(calories),
    proteinG: Math.round(proteinCalories / 4),
    carbsG: Math.round(carbsCalories / 4),
    fatG: Math.round(fatCalories / 9),
    items: template.items,
  };
}

/** Deterministic (no-AI) meal-plan generator — always available, zero cost. */
export function generateDeterministicMealPlan(
  targets: NutritionTargets,
  goal: Goal,
  /** Rotates template selection so re-generating gives variety across weeks. */
  variantSeed = 0,
): {
  meals: MealPlanContent;
  supplements: string[];
  alternatives: string[];
  shoppingList: string[];
} {
  const library = MEAL_LIBRARY[goal];

  const pick = (slot: keyof typeof MEAL_CALORIE_SHARE) => {
    const options = library[slot];
    return options[variantSeed % options.length];
  };

  const meals: MealPlanContent = {
    breakfast: scaleMeal(pick("breakfast"), targets.calories * MEAL_CALORIE_SHARE.breakfast),
    morningSnack: scaleMeal(pick("morningSnack"), targets.calories * MEAL_CALORIE_SHARE.morningSnack),
    lunch: scaleMeal(pick("lunch"), targets.calories * MEAL_CALORIE_SHARE.lunch),
    afternoonSnack: scaleMeal(pick("afternoonSnack"), targets.calories * MEAL_CALORIE_SHARE.afternoonSnack),
    dinner: scaleMeal(pick("dinner"), targets.calories * MEAL_CALORIE_SHARE.dinner),
  };

  const shoppingList = Array.from(
    new Set(
      Object.values(meals).flatMap((m) =>
        m.items.map((item: string) => item.replace(/^[\d.]+\s?(g|ml|tbsp|tsp|scoop|slices?|pieces?)?\s*/i, "").trim()),
      ),
    ),
  );

  return {
    meals,
    supplements: SUPPLEMENTS_BY_GOAL[goal],
    alternatives: ALTERNATIVES_BY_GOAL[goal],
    shoppingList,
  };
}
