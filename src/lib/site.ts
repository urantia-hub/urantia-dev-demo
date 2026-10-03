// Shared with the urantia.dev landing page and the docs. Keep the three sites in step.
// Source of truth: mocks/luma/one-experience.md in the urantia folder.

export const SITE_URL = "https://demo.urantia.dev";
export const HOME_URL = "https://urantia.dev/";
export const QUICKSTART_URL = "https://docs.urantia.dev/quickstart";

export const PRODUCT_LINE = "An API and MCP server for the Urantia Papers.";
export const DESCRIPTION =
  "Try the Urantia Papers API in your browser: search all 197 papers, look up any paragraph, and explore entities. No key needed.";

export type TopLink = { label: string; href: string; current?: boolean };

export const TOP_LINKS: TopLink[] = [
  { label: "Docs", href: "https://docs.urantia.dev/" },
  { label: "API reference", href: "https://docs.urantia.dev/api-reference/introduction" },
  { label: "Demo", href: "https://demo.urantia.dev/", current: true },
];

export const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Docs", href: "https://docs.urantia.dev/" },
      { label: "API reference", href: "https://docs.urantia.dev/api-reference/introduction" },
      { label: "Demo", href: "https://demo.urantia.dev/" },
      { label: "Changelog", href: "https://docs.urantia.dev/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Quickstart", href: "https://docs.urantia.dev/quickstart" },
      { label: "MCP server", href: "https://docs.urantia.dev/mcp-servers" },
      { label: "TypeScript SDK", href: "https://docs.urantia.dev/sdks/overview" },
      { label: "OpenAPI spec", href: "https://api.urantia.dev/openapi.json" },
      { label: "GitHub", href: "https://github.com/urantia-hub/urantia-dev-api" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Report a problem", href: "https://docs.urantia.dev/feedback" },
      { label: "Support the project", href: "https://docs.urantia.dev/support" },
      { label: "Status", href: "https://status.urantia.dev/" },
      { label: "Terms", href: "https://docs.urantia.dev/terms-of-service" },
      { label: "Privacy", href: "https://docs.urantia.dev/privacy-policy" },
    ],
  },
];

export const DISCLAIMER =
  "urantia.dev is an independent community project. It is not affiliated with Urantia Foundation. The English text of The Urantia Book is in the public domain.";
