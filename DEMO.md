# VendorFlow Demo Environment

This document provides instructions for setting up and exploring the VendorFlow demo environment.

## 🚀 Setup Instructions

To initialize the demo environment with realistic data:

```bash
npm run demo:reset
```

This command will:
1.  Reset the local SQLite database.
2.  Push the current Prisma schema.
3.  Seed the database with 15 realistic Indian vendors, admin accounts, and activity data.

## 🔑 Demo Credentials

| Role | Email | OTP |
| :--- | :--- | :--- |
| **Admin** | `admin@vendorflow.demo` | `123456` |
| **Vendor (Verified)** | `vendor1@demo.in` | `123456` |
| **Vendor (Pending)** | `vendor5@demo.in` | `123456` |
| **Vendor (Rejected)** | `vendor8@demo.in` | `123456` |

> **Note:** The OTP system is mocked in the development flow. For demo purposes, any 6-digit code (e.g., `123456`) will work if the backend is configured for demo mode, or you can check the server logs for the actual generated OTP.

## 🛠️ Testing Checklist

### Admin Workflow
- [ ] Log in as `admin@vendorflow.demo`.
- [ ] View the dashboard metrics (staggered animations).
- [ ] Navigate to **Verifications**.
- [ ] Search for "Kirana" or "Gupta".
- [ ] Filter by **PENDING** to see vendors awaiting review.
- [ ] Expand a vendor row and click **View** to see the placeholder GST/PAN/Cheque.
- [ ] Approve or Reject a document (use the new Reject Dialog).

### Vendor Workflow
- [ ] Log in as `vendor1@demo.in`.
- [ ] View the polished dashboard with analytics and status timeline.
- [ ] Check the **Inventory** section to see pre-populated demo products.
- [ ] Observe the "Verified by VendorFlow" badges.

## 📂 Demo Assets
Realistic placeholder documents are located in `/public/demo/`:
- `gst-certificate.svg`
- `pan-card.svg`
- `cancelled-cheque.svg`
