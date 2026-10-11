import type { MetadataRoute } from "next";
import { SITE_URL, HUB_GU, HUB_JOBS, JOB_TYPES, GU_LIST } from "@/lib/constants";
import { getJobs, listFacilities } from "@/lib/repo";
import { GUIDES } from "@/lib/data/guides";
import { jobPath, facilityPath } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getJobs(); const facs = await listFacilities();
  const now = new Date();
  const u = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number, lastModified: Date = now) => ({ url: SITE_URL + encodeURI(path), lastModified, changeFrequency, priority });
  return [
    u("/", "hourly", 1), u("/jobs", "hourly", 0.9), u("/start", "weekly", 0.8), u("/guide", "weekly", 0.7), u("/biz", "weekly", 0.6), u("/biz/ads", "monthly", 0.4), u("/jobs/자격무관", "daily", 0.8),
    ...GUIDES.map(g => u(`/guide/${g.slug}`, "monthly", 0.7)),
    ...GU_LIST.map(g => u(`/jobs/${g}`, "daily", 0.8)),
    ...JOB_TYPES.map(t => u(`/jobs/${t}`, "daily", 0.8)),
    ...HUB_GU.flatMap(g => HUB_JOBS.map(t => u(`/jobs/${g}/${t}`, "daily", 0.7))),
    ...jobs.map(j => u(jobPath(j), "daily", 0.6, new Date(now.getTime() - j.days * 864e5))),
    ...facs.map(f => u(facilityPath(f), "weekly", 0.5)),
  ];
}
