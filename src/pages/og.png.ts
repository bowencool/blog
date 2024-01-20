import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@utils/generateOgImages";
import { changeLanguage } from "i18next";

export const GET: APIRoute = async () => {
  changeLanguage("en");
  return new Response(await generateOgImageForSite(), {
    headers: { "Content-Type": "image/png" },
  });
};
