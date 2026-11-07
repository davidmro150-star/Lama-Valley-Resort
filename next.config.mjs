
import path from "path";

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
  hostname: "cdn.rtvonline.com",
},
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
