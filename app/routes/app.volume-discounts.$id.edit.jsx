import { Form, useLoaderData, useNavigation, redirect, useActionData, Link } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const { id } = params;

  const discount = await db.volumeDiscount.findUnique({
    where: { id, shop },
  });

  if (!discount) {
    throw new Response("Discount not found", { status: 404 });
  }

  return { discount };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const shop = session.shop;

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
    return { error: "Missing required fields" };
  }

  try {
    await db.volumeDiscount.update({
      where: { id: params.id, shop },
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

    return redirect("/app/volume-discounts");
  } catch (error) {
    console.error("Error updating discount:", error);
    return { error: "Failed to update discount: " + error.message };
  }
};

export default function EditVolumeDiscount() {
  const { discount } = useLoaderData();
  const navigation = useNavigation();
  const actionData = useActionData();
  const shopify = useAppBridge();
  const [formData, setFormData] = useState({
    title: discount.title || "",
    description: discount.description || "",
    discountCode: discount.discountCode || "",
    discountType: discount.discountType || "percentage",
    discountValue: discount.discountValue?.toString() || "",
    minQuantity: discount.minQuantity?.toString() || "",
    maxQuantity: discount.maxQuantity?.toString() || "",
    productIds: discount.productIds || "",
    collectionIds: discount.collectionIds || "",
    customerTags: discount.customerTags || "",
    startDate: discount.startDate
      ? new Date(discount.startDate).toISOString().slice(0, 16)
      : "",
    endDate: discount.endDate
      ? new Date(discount.endDate).toISOString().slice(0, 16)
      : "",
    usageLimit: discount.usageLimit?.toString() || "",
    priority: discount.priority?.toString() || "0",
    minOrderAmount: discount.minOrderAmount?.toString() || "",
    maxDiscountAmount: discount.maxDiscountAmount?.toString() || "",
    isActive: discount.isActive?.toString() || "true",
  });

  useEffect(() => {
    if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData, shopify]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isSubmitting = navigation.state === "submitting";

  return (
    <s-page heading="Edit Volume Discount">
      <Form method="post">
        <s-section heading="Discount Details">
          <s-stack direction="block" gap="base">
            <div>
              <s-label for="title">Discount Title *</s-label>
              <s-input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Buy 3 Get 10% Off"
                required
              />
            </div>

            <div>
              <s-label for="description">Description</s-label>
              <s-textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
                rows="3"
              />
            </div>

            <div>
              <s-label for="discountType">Discount Type *</s-label>
              <s-select
                id="discountType"
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </s-select>
            </div>

            <div>
              <s-label for="discountValue">
                Discount Value * ({formData.discountType === "percentage" ? "0-100" : "$"})
              </s-label>
              <s-input
                type="number"
                id="discountValue"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                step={formData.discountType === "percentage" ? "0.01" : "0.01"}
                min="0"
                max={formData.discountType === "percentage" ? "100" : undefined}
                placeholder={
                  formData.discountType === "percentage" ? "10" : "5.00"
                }
                required
              />
            </div>
          </s-stack>
        </s-section>

        <s-section heading="Quantity Rules">
          <s-stack direction="block" gap="base">
            <div>
              <s-label for="minQuantity">Minimum Quantity *</s-label>
              <s-input
                type="number"
                id="minQuantity"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                min="1"
                placeholder="3"
                required
              />
              <s-text size="small" subdued>
                The minimum number of items required to apply this discount
              </s-text>
            </div>

            <div>
              <s-label for="maxQuantity">Maximum Quantity (Optional)</s-label>
              <s-input
                type="number"
                id="maxQuantity"
                name="maxQuantity"
                value={formData.maxQuantity}
                onChange={handleChange}
                min="1"
                placeholder="Leave empty for unlimited"
              />
              <s-text size="small" subdued>
                Maximum quantity this discount applies to (leave empty for unlimited)
              </s-text>
            </div>
          </s-stack>
        </s-section>

        <s-section heading="Product Selection">
          <s-stack direction="block" gap="base">
            <div>
              <s-label for="productIds">Product IDs (Optional)</s-label>
              <s-textarea
                id="productIds"
                name="productIds"
                value={formData.productIds}
                onChange={handleChange}
                placeholder='Enter product IDs separated by commas, e.g., "gid://shopify/Product/123, gid://shopify/Product/456" or leave empty for all products'
                rows="3"
              />
              <s-text size="small" subdued>
                Leave empty to apply discount to all products
              </s-text>
            </div>

            <div>
              <s-label for="isActive">Status</s-label>
              <s-select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </s-select>
            </div>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="inline" gap="base">
            <s-button
              type="submit"
              variant="primary"
              {...(isSubmitting ? { loading: true } : {})}
            >
              Update Discount
            </s-button>
            <Link to="/app/volume-discounts">
              <s-button type="button" variant="secondary">Cancel</s-button>
            </Link>
          </s-stack>
        </s-section>
      </Form>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

