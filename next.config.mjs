
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

 
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "www.kalbela.com",
    },
    {
      protocol: "https",
      hostname: "www.dailymessenger.net",
    },
    {
      protocol: "https",
      hostname: "english.khaborerkagoj.com",
    },
    {
      protocol: "https",
      hostname: "cdn.rtvonline.com",
    },
    {
      protocol: "https",
      hostname: "www.travelmate.com.bd",
    },
    {
      protocol: "https",
      hostname: "adarbepari.com",
    },
  ],
},

};

export default nextConfig;
