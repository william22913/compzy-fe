// Wire shape in, domain shape out. Prices stay integers; ids stay opaque.

function adaptPart(part) {
  return {
    id: part.id,
    name: part.name,
    priceRupiah: part.price_rupiah,
  };
}

export function adaptCategories(data) {
  const categories = data && Array.isArray(data.categories) ? data.categories : [];
  return categories.map((category) => ({
    code: category.code,
    name: category.name,
    required: Boolean(category.required),
    parts: Array.isArray(category.parts) ? category.parts.map(adaptPart) : [],
  }));
}

export function adaptUser(user) {
  // The API serves exactly "en" or "id"; anything else reads as Indonesian so
  // a legacy or hand-edited value never reaches the screen or blocks signing in.
  const preferredLanguage =
    user && (user.preferred_language === 'en' || user.preferred_language === 'id')
      ? user.preferred_language
      : 'id';
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    preferredLanguage,
  };
}

function adaptOrderItem(item) {
  return {
    categoryCode: item.category_code,
    categoryName: item.category_name,
    partName: item.part_name,
    unitPriceRupiah: item.unit_price_rupiah,
  };
}

export function adaptOrder(order) {
  return {
    id: order.id,
    totalRupiah: order.total_rupiah,
    createdAt: order.created_at,
    items: Array.isArray(order.items) ? order.items.map(adaptOrderItem) : [],
  };
}
