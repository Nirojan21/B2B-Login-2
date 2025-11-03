import { useLoaderData, useFetcher, Link } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const discounts = await db.volumeDiscount.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  return { discounts };
};

export default function VolumeDiscountsIndex() {
  const { discounts } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [settings, setSettings] = useState({
    applyAutomatically: true,
    customerGroup: "",
    enableStacking: false,
  });

  useEffect(() => {
    if (fetcher.data?.discount || fetcher.data?.success) {
      shopify.toast.show("Discount updated successfully");
      setTimeout(() => window.location.reload(), 500);
    }
    if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const handleToggle = (id, isActive) => {
    fetcher.submit(
      { intent: "toggle", id, isActive: (!isActive).toString() },
      { method: "POST", action: "/app/volume-discounts" }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      fetcher.submit(
        { intent: "delete", id },
        { method: "POST", action: "/app/volume-discounts" }
      );
    }
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to backend
    shopify.toast.show("Settings saved successfully");
  };

  return (
    <s-page heading="Volume Discounts">
      <div style={{ 
        display: "flex", 
        gap: "24px", 
        marginTop: "20px",
        flexWrap: "wrap"
      }}>
        {/* Main Content Area */}
        <div style={{ 
          flex: "1 1 600px",
          minWidth: 0
        }}>
          {/* Header Card */}
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="base"
            style={{ 
              marginBottom: "16px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div>
                <s-heading level={2} style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
                  Volume Discounts
                </s-heading>
              </div>
              <Link to="/app/volume-discounts/new" style={{ textDecoration: "none" }}>
                <s-button variant="primary">Add Tier</s-button>
              </Link>
            </div>
          </s-box>

          {/* Discounts Table Card */}
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="base"
            style={{ 
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
          >
            {discounts && discounts.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px"
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: "2px solid #e1e3e5",
                      backgroundColor: "#f6f6f7"
                    }}>
                      <th style={{ 
                        padding: "12px 16px", 
                        fontWeight: "600", 
                        color: "#202223", 
                        fontSize: "13px",
                        textAlign: "left"
                      }}>
                        Minimum Quantity
                      </th>
                      <th style={{ 
                        padding: "12px 16px", 
                        fontWeight: "600", 
                        color: "#202223", 
                        fontSize: "13px",
                        textAlign: "left"
                      }}>
                        Maximum Quantity
                      </th>
                      <th style={{ 
                        padding: "12px 16px", 
                        fontWeight: "600", 
                        color: "#202223", 
                        fontSize: "13px",
                        textAlign: "left"
                      }}>
                        Discount Type
                      </th>
                      <th style={{ 
                        padding: "12px 16px", 
                        fontWeight: "600", 
                        color: "#202223", 
                        fontSize: "13px",
                        textAlign: "left"
                      }}>
                        Discount Value
                      </th>
                      <th style={{ 
                        padding: "12px 16px", 
                        fontWeight: "600", 
                        color: "#202223", 
                        fontSize: "13px",
                        textAlign: "right"
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((discount, index) => (
                      <tr
                        key={discount.id}
                        style={{
                          borderBottom: index < discounts.length - 1 ? "1px solid #e1e3e5" : "none",
                          transition: "background-color 0.15s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fafbfb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "16px" }}>
                          <s-text weight="semibold">{discount.minQuantity}</s-text>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <s-text>{discount.maxQuantity || "∞"}</s-text>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <select
                            value={discount.discountType}
                            disabled
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                              backgroundColor: "#ffffff",
                              color: "#202223",
                              fontSize: "14px",
                              fontWeight: "400",
                              cursor: "not-allowed",
                              minWidth: "140px",
                              appearance: "none",
                              backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                              backgroundPosition: "right 8px center",
                              backgroundRepeat: "no-repeat",
                              backgroundSize: "16px"
                            }}
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed_amount">Fixed Amount</option>
                          </select>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <s-text weight="semibold" style={{ color: "#008060", fontSize: "14px" }}>
                            {discount.discountType === "percentage"
                              ? `${discount.discountValue}%`
                              : `$${discount.discountValue.toFixed(2)}`}
                          </s-text>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ 
                            display: "flex", 
                            gap: "8px", 
                            justifyContent: "flex-end",
                            alignItems: "center"
                          }}>
                            {/* Enable/Disable Toggle */}
                            <button
                              onClick={() => handleToggle(discount.id, discount.isActive)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: discount.isActive ? "#008060" : "#d1d5db",
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "background-color 0.2s ease",
                                minWidth: "80px"
                              }}
                              onMouseEnter={(e) => {
                                if (discount.isActive) {
                                  e.target.style.backgroundColor = "#006e52";
                                } else {
                                  e.target.style.backgroundColor = "#9ca3af";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = discount.isActive ? "#008060" : "#d1d5db";
                              }}
                            >
                              {discount.isActive ? "Enabled" : "Disabled"}
                            </button>
                            <Link
                              to={`/app/volume-discounts/${discount.id}/edit`}
                              style={{ textDecoration: "none" }}
                            >
                              <s-button
                                variant="secondary"
                                style={{ 
                                  fontSize: "13px", 
                                  padding: "6px 16px",
                                  border: "1px solid #d1d5db"
                                }}
                              >
                                Edit
                              </s-button>
                            </Link>
                            <s-button
                              variant="critical"
                              onClick={() => handleDelete(discount.id)}
                              style={{ 
                                fontSize: "13px", 
                                padding: "6px 16px"
                              }}
                            >
                              Delete
                            </s-button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "64px 24px",
                color: "#6b7280"
              }}>
                <s-stack direction="block" gap="base">
                  <s-text size="large" subdued>
                    No volume discounts created yet
                  </s-text>
                  <s-text size="small" subdued style={{ marginBottom: "16px" }}>
                    Create your first discount tier to get started
                  </s-text>
                  <Link to="/app/volume-discounts/new" style={{ textDecoration: "none" }}>
                    <s-button variant="primary">Create Your First Discount</s-button>
                  </Link>
                </s-stack>
              </div>
            )}
          </s-box>
        </div>

        {/* Backend Options Sidebar */}
        <div style={{
          width: "340px",
          flexShrink: 0,
          flexBasis: "340px"
        }}>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="base"
            style={{ 
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              position: "sticky",
              top: "20px"
            }}
          >
            <s-stack direction="block" gap="base">
              <s-heading level={3} style={{ 
                marginBottom: "4px",
                fontSize: "18px",
                fontWeight: "600",
                color: "#202223"
              }}>
                Backend Options
              </s-heading>

              {/* Apply Tier Automatically */}
              <div style={{ 
                padding: "12px 0",
                borderBottom: "1px solid #e1e3e5"
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "12px",
                  cursor: "pointer"
                }}>
                  <input
                    type="checkbox"
                    id="applyAutomatically"
                    checked={settings.applyAutomatically}
                    onChange={(e) =>
                      setSettings({ ...settings, applyAutomatically: e.target.checked })
                    }
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#008060",
                      marginTop: "2px",
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <s-text weight="medium" style={{ 
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px"
                    }}>
                      Apply Tier Automatically
                    </s-text>
                    <s-text size="small" subdued style={{ 
                      fontSize: "13px",
                      lineHeight: "1.5",
                      color: "#6b7280"
                    }}>
                      Automatically apply the best tier based on cart quantity
                    </s-text>
                  </div>
                </label>
              </div>

              {/* Limit to Customer Group */}
              <div style={{ 
                padding: "12px 0",
                borderBottom: "1px solid #e1e3e5"
              }}>
                <s-label 
                  for="customerGroup" 
                  style={{ 
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202223"
                  }}
                >
                  Limit to Customer Group
                </s-label>
                <s-select
                  id="customerGroup"
                  name="customerGroup"
                  value={settings.customerGroup}
                  onChange={(e) =>
                    setSettings({ ...settings, customerGroup: e.target.value })
                  }
                  style={{
                    width: "100%",
                    fontSize: "14px"
                  }}
                >
                  <option value="">All Customers</option>
                  <option value="vip">VIP Customers</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="members">Members</option>
                  <option value="new">New Customers</option>
                </s-select>
                <s-text size="small" subdued style={{ 
                  display: "block", 
                  marginTop: "6px",
                  fontSize: "13px",
                  color: "#6b7280"
                }}>
                  Select a customer group to limit this discount
                </s-text>
              </div>

              {/* Enable Stacking */}
              <div style={{ 
                padding: "12px 0",
                borderBottom: "1px solid #e1e3e5"
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "12px",
                  cursor: "pointer"
                }}>
                  <input
                    type="checkbox"
                    id="enableStacking"
                    checked={settings.enableStacking}
                    onChange={(e) =>
                      setSettings({ ...settings, enableStacking: e.target.checked })
                    }
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#008060",
                      marginTop: "2px",
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <s-text weight="medium" style={{ 
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px"
                    }}>
                      Enable Stacking
                    </s-text>
                    <s-text size="small" subdued style={{ 
                      fontSize: "13px",
                      lineHeight: "1.5",
                      color: "#6b7280"
                    }}>
                      Allow this discount to stack with other discounts
                    </s-text>
                  </div>
                </label>
              </div>

              {/* Save Settings Button */}
              <div style={{ paddingTop: "8px" }}>
                <s-button
                  variant="primary"
                  onClick={handleSaveSettings}
                  style={{ 
                    width: "100%",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Save Settings
                </s-button>
              </div>
            </s-stack>
          </s-box>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
