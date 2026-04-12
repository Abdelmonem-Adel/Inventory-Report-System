export const SUB_CATEGORY_TO_CATEGORY = {
  'BFC - Beans': 'Coffee & Other',
  'BFC - Capsules': 'Coffee & Other',
  'Breadfast Coffee': 'Coffee & Other',
  'BFC Mood Blends': 'Coffee & Other',
  'Coffee & Other Drinks': 'Coffee & Other',
  'Frozen Starters, cheese & FV': 'Frozen',
  'Frozen Centralized': 'Frozen',
  'Frozen Pastries': 'Frozen',
  'Frozen Breaded Chicken, Sausage & Burgers': 'Frozen',
  'Frozen Meals': 'Frozen',
  'Frozen Poultry & Meat': 'Frozen',
  'Frozen Desserts and Ice Cream': 'Frozen',
  'Frozen Sea & Dog Foods': 'Frozen',
  'Home Care': 'Home Care',
  'Stationary & Games': 'Home Care',
  'Nonfood': 'Home Care', // Note: mapped to Home Care as it appeared there first in the list
  'Electronics': 'Home Care',
  'Stationary': 'Home Care',
  'Ramadan Gifts': 'Home Care',
  'Units': 'Home Care',
  'Beauty': 'Beauty',
  'Skin Care': 'Beauty',
  'Lips': 'Beauty',
  'Beauty Bag': 'Beauty',
  'Perfumes': 'Beauty',
  'Juice': 'Soda & Milk & Juice',
  'Milk': 'Soda & Milk & Juice',
  'Soda': 'Soda & Milk & Juice',
  'Milk and Juice': 'Soda & Milk & Juice',
  'Chocolates Warehouse': 'Chocolates Warehouse',
  'Food Cupboard': 'Food Cupboard',
  'Food Cupboard 2': 'Food Cupboard',
  'Personal Care': 'Personal Care',
  'Personal Care 2': 'Personal Care',
  'Snacks': 'Snacks',
  'Warehouse': 'Snacks',
  'Bundles': 'Snacks',
  'Yogurt': 'Centralized Fresh',
  'Centralized Fresh': 'Centralized Fresh',
  'Food': 'Food',
  'Pet Care': 'Pet Care',
  'Tissues': 'Tissues',
  'Commodities': 'Commodities',
  'Vitamins & Supplements': 'Vitamins & Supplements',
  'Water': 'Water'
};

export const CATEGORY_TO_MAIN = {
  'Home Care': 'Non Food',
  'Beauty': 'Non Food',
  'Personal Care': 'Non Food',
  'Pet Care': 'Non Food',
  'Tissues': 'Non Food',
  'Vitamins & Supplements': 'Non Food',
  'Coffee & Other': 'Coffee & Other',
  'Soda & Milk & Juice': 'Market',
  'Food Cupboard': 'Market',
  'Chocolates Warehouse': 'Market',
  'Snacks': 'Market',
  'Food': 'Market',
  'Commodities': 'Market',
  'Water': 'Market',
  'Centralized Fresh': 'Cheld',
  'Yogurt': 'Cheld',
  'Frozen': 'Frozen'
};

export const getCategoryForSub = (sub) => {
  if (!sub) return 'Uncategorized';
  const mapping = SUB_CATEGORY_TO_CATEGORY[sub.trim()];
  return mapping || 'Other';
};

export const CATEGORIES_L1 = [
  ...new Set(Object.values(SUB_CATEGORY_TO_CATEGORY))
].sort();

export const CATEGORIES_BY_MAIN = CATEGORIES_L1.reduce((acc, cat) => {
  const main = CATEGORY_TO_MAIN[cat] || 'Other';
  if (!acc[main]) acc[main] = [];
  acc[main].push(cat);
  return acc;
}, {});
