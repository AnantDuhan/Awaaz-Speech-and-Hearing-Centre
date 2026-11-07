import type { MetadataRoute } from "next";
import { allowSearchIndexing } from "@/content/launch";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Before launch, crawling stays allowed on purpose: Google has to fetch a page
  // to see its "noindex" tag. Blocking it here could still get the bare URL listed.
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(allowSearchIndexing ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
