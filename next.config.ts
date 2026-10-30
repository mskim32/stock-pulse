import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // yahoo-finance2 is a server-only Node package; keep it out of the bundle.
  serverExternalPackages: ["yahoo-finance2"],
};

export default nextConfig;
