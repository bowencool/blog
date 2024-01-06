import type { Site, SocialObjects } from "./types";
import { t } from "i18next";

export const SITE: Site = {
  website: "https://blog.bowen.cool", // replace this with your deployed domain
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 10,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/bowencool",
    linkTitle: `Follow ${t("websiteAuthor")} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/bowen_cool_",
    linkTitle: `Follow ${t("websiteAuthor")} on Twitter`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:root@bowen.cool",
    linkTitle: `Send an email to ${t("websiteAuthor")}`,
    active: true,
  },
];
