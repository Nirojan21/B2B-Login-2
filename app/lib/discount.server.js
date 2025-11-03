import db from "../db.server";

/**
 * Calculate volume discount for a given cart
 * @param {string} shop - Shop domain
 * @param {Array} lineItems - Cart line items with { productId, quantity, price }
 * @returns {Object} - { discountAmount, appliedDiscount }
 */
export async function calculateVolumeDiscount(shop, lineItems) {
  // Get all active volume discounts for the shop
  const discounts = await db.volumeDiscount.findMany({
    where: {
      shop,
      isActive: true,
    },
    orderBy: {
      minQuantity: "asc", // Apply higher quantity discounts first
    },
  });

  if (discounts.length === 0) {
    return { discountAmount: 0, appliedDiscount: null };
  }

  let totalDiscount = 0;
  let appliedDiscount = null;

  // Process each line item
  for (const lineItem of lineItems) {
    const quantity = lineItem.quantity;
    const price = parseFloat(lineItem.price);

    // Find applicable discount for this quantity
    const applicableDiscount = discounts.find((discount) => {
      // Check if discount applies to this product
      const productIds = discount.productIds
        ? JSON.parse(discount.productIds)
        : null;

      // If productIds is set, check if this product is included
      if (productIds && !productIds.includes(lineItem.productId)) {
        return false;
      }

      // Check quantity range
      const meetsMinQuantity = quantity >= discount.minQuantity;
      const meetsMaxQuantity =
        !discount.maxQuantity || quantity <= discount.maxQuantity;

      return meetsMinQuantity && meetsMaxQuantity;
    });

    if (applicableDiscount) {
      const lineTotal = price * quantity;
      let lineDiscount = 0;

      if (applicableDiscount.discountType === "percentage") {
        // Percentage discount
        lineDiscount = (lineTotal * applicableDiscount.discountValue) / 100;
      } else {
        // Fixed amount discount
        lineDiscount = applicableDiscount.discountValue;
        // Ensure discount doesn't exceed line total
        lineDiscount = Math.min(lineDiscount, lineTotal);
      }

      totalDiscount += lineDiscount;
      appliedDiscount = applicableDiscount;
    }
  }

  return {
    discountAmount: Math.round(totalDiscount * 100) / 100, // Round to 2 decimal places
    appliedDiscount,
  };
}

/**
 * Get all active discounts for a shop
 * @param {string} shop - Shop domain
 * @returns {Array} - Array of active discounts
 */
export async function getActiveDiscounts(shop) {
  return await db.volumeDiscount.findMany({
    where: {
      shop,
      isActive: true,
    },
    orderBy: {
      minQuantity: "asc",
    },
  });
}

/**
 * Get discount by ID
 * @param {string} shop - Shop domain
 * @param {string} id - Discount ID
 * @returns {Object|null} - Discount or null
 */
export async function getDiscountById(shop, id) {
  return await db.volumeDiscount.findUnique({
    where: {
      id,
      shop,
    },
  });
}

