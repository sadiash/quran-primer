import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Allow Turbopack in dev alongside webpack-based PWA plugin
  turbopack: {},
  devIndicators: false,
};

export default withPWA(nextConfig);
