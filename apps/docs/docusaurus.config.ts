import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "BashBuddy",
  tagline: "Your AI-powered terminal assistant",
  favicon: "favicon.ico",

  // Set the production url of your site here
  url: "https://docs.bashbuddy.run",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "wosherco", // Usually your GitHub org/user name.
  projectName: "bashbuddy", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Remove the "edit this page" links
          editUrl: undefined,
          routeBasePath: "/", // Set docs as the root
        },
        blog: false, // Disable the blog plugin
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "android-chrome-512x512.png",
    navbar: {
      title: "BashBuddy",
      logo: {
        alt: "BashBuddy Logo",
        src: "android-chrome-512x512.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/wosherco/bashbuddy",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/",
            },
            {
              label: "Install",
              to: "/install",
            },
            {
              label: "BashBuddy Cloud",
              to: "/cloud",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.com/invite/knDFUB5UtU",
            },
            {
              label: "GitHub Discussions",
              href: "https://github.com/wosherco/bashbuddy/discussions",
            },
            {
              label: "GitHub Issues",
              href: "https://github.com/wosherco/bashbuddy/issues",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} wosher.co. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
