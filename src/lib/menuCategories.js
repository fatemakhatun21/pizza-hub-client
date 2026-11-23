export const MENU_CATEGORIES = [
    "All Categories",
    "Classic Pizzas",
    "Vegetarian Pizzas",
    "Meat Lovers",
    "Specialty Pizzas",
    "Sides & Appetizers",
    "Beverages & Desserts",
];

export const VENDOR_CATEGORIES = MENU_CATEGORIES.filter(
    (category) => category !== "All Categories"
);

/** Display legacy database values with the current category name. */
export function normalizeCategoryName(value) {
    const name = String(value ?? "").trim();

    return name === "Specialty / Gourmet Pizzas"
        ? "Specialty Pizzas"
        : name;
}
