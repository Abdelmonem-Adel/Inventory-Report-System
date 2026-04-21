export const WORKING_HOURS_PER_DAY = 7;

export const MANPOWER_RATES = [
  {category: 'Beauty', pickingPerHour: 60 , avaliablePickers: 10 },
  {category: 'Beauty Bags', pickingPerHour: 500, avaliablePickers: 1},
  {category: 'Lips', pickingPerHour: 60, avaliablePickers: 2},
  {category: 'Perfumes', pickingPerHour: 60, avaliablePickers: 3},
  {category: 'Skin Care', pickingPerHour: 60, avaliablePickers: 5},
  {category: 'BFC - Beans', pickingPerHour: 48, avaliablePickers: 2},
  {category: 'BFC - Capsules', pickingPerHour: 30, avaliablePickers: 1},
  {category: 'Coffee & Other Drinks', pickingPerHour: 161, avaliablePickers: 10},
  {category: 'Commodities', pickingPerHour: 561, avaliablePickers: 9},
  {category: 'Food', pickingPerHour: 796, avaliablePickers: 12},
  {category: 'Food Cupboard', pickingPerHour: 567, avaliablePickers: 9},
  {category: 'Food Cupboard 2', pickingPerHour: 452, avaliablePickers: 3},
  {category: 'Home Care', pickingPerHour: 196, avaliablePickers: 14},
  {category: 'Personal Care', pickingPerHour: 153, avaliablePickers: 8},
  {category: 'Personal Care 2', pickingPerHour: 161, avaliablePickers: 4},
  {category: 'Pet Care', pickingPerHour: 191, avaliablePickers: 3},
  {category: 'Snacks', pickingPerHour: 592, avaliablePickers: 14},
  {category: 'Soda', pickingPerHour: 1116, avaliablePickers: 8},
  {category: 'Tissues', pickingPerHour: 312, avaliablePickers: 7},
  {category: 'Vitamins & Supplements', pickingPerHour: 80, avaliablePickers: 3},
  {category: 'Centralized Fresh', pickingPerHour: 317, avaliablePickers: 7},
  {category: 'Yogurt', pickingPerHour: 506, avaliablePickers: 10},
  {category: 'Frozen Breaded Chicken, Sausage & Burgers', pickingPerHour: 335, avaliablePickers: 3},
  {category: 'Frozen Centralized', pickingPerHour: 277, avaliablePickers: 1},
  {category: 'Frozen Desserts and Ice Cream', pickingPerHour: 339, avaliablePickers: 2},
  {category: 'Frozen Meals', pickingPerHour: 210, avaliablePickers: 2},
  {category: 'Frozen Pastries', pickingPerHour: 136, avaliablePickers: 2},
  {category: 'Frozen & MPoultry eat', pickingPerHour: 183, avaliablePickers: 5},
  {category: 'Frozen Sea & Dog Foods', pickingPerHour: 199, avaliablePickers: 1},
  {category: 'Frozen Starters, cheese & FV', pickingPerHour: 300, avaliablePickers: 8},
  {category: 'Chocolates Warehouse', pickingPerHour: 342, avaliablePickers: 10},
  {category: 'Juice', pickingPerHour: 746, avaliablePickers: 4},
  {category: 'Milk', pickingPerHour: 840, avaliablePickers: 7},
  {category: 'Bags', pickingPerHour: 15000, avaliablePickers: 3},
  {category: 'Water', pickingPerHour: 113, avaliablePickers: 14},



].map(item => ({
  ...item,
  pickingPerDay: item.pickingPerHour * WORKING_HOURS_PER_DAY
}));
