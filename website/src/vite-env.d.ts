/// <reference types="vite/client" />

declare const __PKG_NAME__: string;
declare const __PKG_VERSION__: string;
declare const __PKG_DEPS__: number;
declare const __BUILD_YEAR__: number;

interface ImportMetaEnv {
  /** Public URL of the deployed site, with trailing slash. Used for canonical/OG tags and the sitemap. */
  readonly VITE_SITE_URL?: string;
  /** GoatCounter site code (the `xyz` in xyz.goatcounter.com). Enables the live visit counter. */
  readonly VITE_GOATCOUNTER_CODE?: string;
}
