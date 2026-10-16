import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://medbasehealth.com" },
    { url: "https://medbasehealth.com/pilot-info" },
  ];
}
