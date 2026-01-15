// sanity/lib/live.ts
import { defineLive } from "next-sanity";
import { client } from './client';

// 1. Add your token here if you want to see Drafts
// You need a Viewer Token from https://sanity.io/manage
const token = process.env.SANITY_API_READ_TOKEN;

export const { sanityFetch, SanityLive } = defineLive({ 
  client: client.withConfig({ 
    // Live content is currently only available on the experimental API
    apiVersion: 'v2024-01-01' // 👈 Use a real date string here
  }),
  serverToken: token, 
  browserToken: token, 
  fetchOptions: {
    revalidate: 0, // Optional: ensures fresh data in dev
  }
});