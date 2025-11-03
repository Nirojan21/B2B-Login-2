import { Outlet } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  const discounts = await db.volumeDiscount.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return { discounts };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = formData.get("title");
    const description = formData.get("description") || null;
    const discountCode = formData.get("discountCode") || null;
    const discountType = formData.get("discountType");
    const discountValue = parseFloat(formData.get("discountValue"));
    const minQuantity = parseInt(formData.get("minQuantity"));
    const maxQuantity = formData.get("maxQuantity")
      ? parseInt(formData.get("maxQuantity"))
      : null;
    const productIds = formData.get("productIds") || null;
    const collectionIds = formData.get("collectionIds") || null;
    const customerTags = formData.get("customerTags") || null;
    const startDate = formData.get("startDate")
      ? new Date(formData.get("startDate"))
      : null;
    const endDate = formData.get("endDate")
      ? new Date(formData.get("endDate"))
      : null;
    const usageLimit = formData.get("usageLimit")
      ? parseInt(formData.get("usageLimit"))
      : null;
    const priority = formData.get("priority")
      ? parseInt(formData.get("priority"))
      : 0;
    const minOrderAmount = formData.get("minOrderAmount")
      ? parseFloat(formData.get("minOrderAmount"))
      : null;
    const maxDiscountAmount = formData.get("maxDiscountAmount")
      ? parseFloat(formData.get("maxDiscountAmount"))
      : null;
    const isActive = formData.get("isActive") === "true";

    if (!title || !discountType || !discountValue || !minQuantity) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discount = await db.volumeDiscount.create({
      data: {
        shop,
        title,
        description,
        discountCode,
        discountType,
        discountValue,
        minQuantity,
        maxQuantity,
        productIds,
        collectionIds,
        customerTags,
        startDate,
        endDate,
        usageLimit,
        priority,
        minOrderAmount,
        maxDiscountAmount,
        isActive,
      },
    });

    return { discount };
  }

  if (intent === "update") {
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description") || null;
    const discountCode = formData.get("discountCode") || null;
    const discountType = formData.get("discountType");
    const discountValue = parseFloat(formData.get("discountValue"));
    const minQuantity = parseInt(formData.get("minQuantity"));
    const maxQuantity = formData.get("maxQuantity")
      ? parseInt(formData.get("maxQuantity"))
      : null;
    const productIds = formData.get("productIds") || null;
    const collectionIds = formData.get("collectionIds") || null;
    const customerTags = formData.get("customerTags") || null;
    const startDate = formData.get("startDate")
      ? new Date(formData.get("startDate"))
      : null;
    const endDate = formData.get("endDate")
      ? new Date(formData.get("endDate"))
      : null;
    const usageLimit = formData.get("usageLimit")
      ? parseInt(formData.get("usageLimit"))
      : null;
    const priority = formData.get("priority")
      ? parseInt(formData.get("priority"))
      : 0;
    const minOrderAmount = formData.get("minOrderAmount")
      ? parseFloat(formData.get("minOrderAmount"))
      : null;
    const maxDiscountAmount = formData.get("maxDiscountAmount")
      ? parseFloat(formData.get("maxDiscountAmount"))
      : null;
    const isActive = formData.get("isActive") === "true";

    if (!id || !title || !discountType || !discountValue || !minQuantity) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discount = await db.volumeDiscount.update({
      where: { id },
      data: {
        title,
        description,
        discountCode,
        discountType,
        discountValue,
        minQuantity,
        maxQuantity,
        productIds,
        collectionIds,
        customerTags,
        startDate,
        endDate,
        usageLimit,
        priority,
        minOrderAmount,
        maxDiscountAmount,
        isActive,
      },
    });

    return { discount };
  }

  if (intent === "delete") {
    const id = formData.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing discount ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.volumeDiscount.delete({
      where: { id },
    });

    return { success: true };
  }

  if (intent === "toggle") {
    const id = formData.get("id");
    const isActive = formData.get("isActive") === "true";

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing discount ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const discount = await db.volumeDiscount.update({
      where: { id },
      data: { isActive },
    });

    return { discount };
  }

  return new Response(JSON.stringify({ error: "Invalid intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export default function VolumeDiscounts() {
  return <Outlet />;
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

