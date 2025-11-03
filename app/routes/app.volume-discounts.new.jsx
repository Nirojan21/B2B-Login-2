import { Form, useNavigation, redirect, useActionData, Link } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

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
    const shop = session.shop;

    await db.volumeDiscount.create({
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

    return redirect("/app/volume-discounts");
  } catch (error) {
    console.error("Error creating discount:", error);
    return { error: "Failed to create discount: " + error.message };
  }
};

export default function NewVolumeDiscount() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const shopify = useAppBridge();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountCode: "",
    discountType: "percentage",
    discountValue: "",
    minQuantity: "",
    maxQuantity: "",
    productIds: "",
    collectionIds: "",
    customerTags: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    priority: "0",
    minOrderAmount: "",
    maxDiscountAmount: "",
    isActive: "true",
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
    <s-page heading="Create Volume Discount">
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
              <s-label for="discountCode">Discount Code (Optional)</s-label>
              <s-input
                type="text"
                id="discountCode"
                name="discountCode"
                value={formData.discountCode}
                onChange={handleChange}
                placeholder="e.g., VOLUME10"
              />
              <s-text size="small" subdued>
                Optional code customers can enter at checkout
              </s-text>
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

        <s-section heading="Product & Collection Selection">
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
              <s-label for="collectionIds">Collection IDs (Optional)</s-label>
              <s-textarea
                id="collectionIds"
                name="collectionIds"
                value={formData.collectionIds}
                onChange={handleChange}
                placeholder='Enter collection IDs separated by commas, e.g., "gid://shopify/Collection/123"'
                rows="2"
              />
              <s-text size="small" subdued>
                Apply discount to products in these collections
              </s-text>
            </div>

            <div>
              <s-label for="customerTags">Customer Tags (Optional)</s-label>
              <s-textarea
                id="customerTags"
                name="customerTags"
                value={formData.customerTags}
                onChange={handleChange}
                placeholder='Enter customer tags separated by commas, e.g., "VIP, Wholesale" or leave empty for all customers'
                rows="2"
              />
              <s-text size="small" subdued>
                Apply discount only to customers with these tags
              </s-text>
            </div>
          </s-stack>
        </s-section>

        <s-section heading="Date & Usage Settings">
          <s-stack direction="block" gap="base">
            <div>
              <s-label for="startDate">Start Date (Optional)</s-label>
              <s-input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              <s-text size="small" subdued>
                When the discount becomes active (leave empty for immediate activation)
              </s-text>
            </div>

            <div>
              <s-label for="endDate">End Date (Optional)</s-label>
              <s-input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
              <s-text size="small" subdued>
                When the discount expires (leave empty for no expiration)
              </s-text>
            </div>

            <div>
              <s-label for="usageLimit">Usage Limit (Optional)</s-label>
              <s-input
                type="number"
                id="usageLimit"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 100"
              />
              <s-text size="small" subdued>
                Maximum number of times this discount can be used (leave empty for unlimited)
              </s-text>
            </div>
          </s-stack>
        </s-section>

        <s-section heading="Advanced Settings">
          <s-stack direction="block" gap="base">
            <div>
              <s-label for="priority">Priority</s-label>
              <s-input
                type="number"
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
              <s-text size="small" subdued>
                Higher priority discounts apply first when multiple discounts are available (default: 0)
              </s-text>
            </div>

            <div>
              <s-label for="minOrderAmount">Minimum Order Amount (Optional)</s-label>
              <s-input
                type="number"
                id="minOrderAmount"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 50.00"
              />
              <s-text size="small" subdued>
                Minimum order total required to apply this discount
              </s-text>
            </div>

            {formData.discountType === "percentage" && (
              <div>
                <s-label for="maxDiscountAmount">Maximum Discount Amount (Optional)</s-label>
                <s-input
                  type="number"
                  id="maxDiscountAmount"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 100.00"
                />
                <s-text size="small" subdued>
                  Maximum discount amount for percentage discounts (leave empty for no limit)
                </s-text>
              </div>
            )}

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
              Create Discount
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

