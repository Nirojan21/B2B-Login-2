import { authenticate } from "../shopify.server";
import { calculateVolumeDiscount } from "../lib/discount.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

/**
 * API endpoint to calculate volume discounts for cart items
 * POST /api/discounts/calculate
 * Body: { lineItems: [{ productId, quantity, price }] }
 */
export const action = async ({ request }) => {
  try {
    // For checkout extensions, you might want to use unauthenticated
    // For now, we'll require admin auth
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const body = await request.json();
    const { lineItems } = body;

    if (!lineItems || !Array.isArray(lineItems)) {
      return new Response(JSON.stringify({ error: "lineItems array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await calculateVolumeDiscount(shop, lineItems);

    return new Response(
      JSON.stringify({
        discountAmount: result.discountAmount,
        appliedDiscount: result.appliedDiscount
          ? {
              id: result.appliedDiscount.id,
              title: result.appliedDiscount.title,
              discountType: result.appliedDiscount.discountType,
              discountValue: result.appliedDiscount.discountValue,
            }
          : null,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating discount:", error);
    return new Response(JSON.stringify({ error: "Failed to calculate discount" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

