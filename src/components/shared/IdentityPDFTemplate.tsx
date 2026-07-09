import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    color: "#ea580c",
    fontWeight: "bold",
  },
  subLogoText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  businessIdBox: {
    alignItems: "flex-end",
  },
  businessIdLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  businessIdValue: {
    fontSize: 14,
    backgroundColor: "#f3f4f6",
    padding: "4 8",
    borderRadius: 4,
    fontFamily: "Courier",
  },
  mainContent: {
    flexDirection: "row",
    marginBottom: 30,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 20,
  },
  rightColumn: {
    width: 150,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: "6 12",
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  verifiedText: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 12,
  },
  sectionValue: {
    fontSize: 12,
    color: "#111827",
  },
  qrCode: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 40,
  },
  gridBox: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  gridBoxBlue: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
  },
  complianceTitle: {
    fontSize: 12,
    color: "#1d4ed8",
    fontWeight: "bold",
    marginBottom: 6,
  },
  complianceText: {
    fontSize: 10,
    color: "#1e3a8a",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export const IdentityPDFTemplate = ({ data, qrCodeDataUrl }: { data: any, qrCodeDataUrl: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>VyapaarSetu</Text>
          <Text style={styles.subLogoText}>Digital Business Identity</Text>
        </View>
        <View style={styles.businessIdBox}>
          <Text style={styles.businessIdLabel}>Business ID</Text>
          <Text style={styles.businessIdValue}>{data.businessId || "VS-XXXXXXX"}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.leftColumn}>
          <Text style={styles.title}>{data.vendor.businessName}</Text>
          <Text style={styles.subtitle}>{data.vendor.businessType}</Text>

          {data.status === "APPROVED" && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Business</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>Registered Location</Text>
          <Text style={styles.sectionValue}>
            {data.vendor.city || "N/A"}, {data.vendor.state || "N/A"}
          </Text>

          <Text style={styles.sectionLabel}>Contact Info</Text>
          <Text style={styles.sectionValue}>{data.vendor.email}</Text>
          <Text style={styles.sectionValue}>{data.vendor.phone}</Text>

          <Text style={styles.sectionLabel}>Industry</Text>
          <Text style={styles.sectionValue}>{data.vendor.industry || "N/A"}</Text>

          <Text style={styles.sectionLabel}>Tax Details</Text>
          <Text style={styles.sectionValue}>GST: {data.vendor.gstNumber ? "XXXX" + data.vendor.gstNumber.slice(-4) : "N/A"}</Text>
          <Text style={styles.sectionValue}>PAN: {data.vendor.panNumber ? "XXXXXX" + data.vendor.panNumber.slice(-4) : "N/A"}</Text>
        </View>

        <View style={styles.rightColumn}>
          {qrCodeDataUrl && <Image src={qrCodeDataUrl} style={styles.qrCode} />}
          <Text style={styles.qrText}>Scan to verify authenticity on VyapaarSetu</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        <View style={styles.gridBoxBlue}>
          <Text style={styles.complianceTitle}>Shield Compliance</Text>
          <Text style={styles.complianceText}>
            This business meets VyapaarSetu's stringent compliance and verification standards. All submitted identities and documents have been reviewed.
          </Text>
        </View>
        <View style={styles.gridBox}>
          <Text style={styles.sectionLabel}>Generated On</Text>
          <Text style={styles.sectionValue}>{new Date().toLocaleDateString()}</Text>

          <Text style={styles.sectionLabel}>Digital Stamp</Text>
          <Text style={[styles.sectionValue, { fontSize: 9, fontFamily: "Courier", marginTop: 4 }]}>
            {data.businessId}-AUTH-{Date.now()}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This document is generated by VyapaarSetu for informational purposes.{"\n"}
          Visit vyapaarsetu.com to verify real-time status.
        </Text>
      </View>
    </Page>
  </Document>
);
