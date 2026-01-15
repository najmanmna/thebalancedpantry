'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'

// 👇 Custom Structure & Document Node
import { structure, defaultDocumentNode } from './sanity/studioStructure'

// 👇 Custom Tools (Tabs)
// import { ordersSummaryTool } from './sanity/views/ordersSummaryTool'
// import { stockReportTool } from './sanity/views/stockReportTool'

// 👇 Custom Actions (Publish Button Logic)
import { useOrderActions } from './sanity/orderActions'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,

  plugins: [
    structureTool({
      structure,
      defaultDocumentNode, 
    }),
    // ordersSummaryTool(),
    // stockReportTool(),
    // Vision is for querying with GROQ from inside the Studio
    visionTool({defaultApiVersion: apiVersion}),
  ],

  // 👇 This must be OUTSIDE the plugins array
  document: {
    actions: (prev, context) => {
      // Only apply this custom logic to 'order' documents
      if (context.schemaType === 'order') {
        return useOrderActions(prev)
      }
      return prev
    },
  },
})