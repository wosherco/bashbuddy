import { browser } from "$app/environment";
import {
  PUBLIC_POSTHOG_API_KEY,
  PUBLIC_POSTHOG_ENDPOINT,
} from "$env/static/public";
import posthog from "posthog-js";

import type { LayoutLoad } from "./$types";

export const prerender = true;

export const load: LayoutLoad = () => {
  if (browser) {
    posthog.init(PUBLIC_POSTHOG_API_KEY, {
      api_host: PUBLIC_POSTHOG_ENDPOINT,
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: false,
    });
  }
};
