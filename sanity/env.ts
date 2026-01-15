export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-09'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || '739ne3eq',
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

// This function checks if the value exists.
// By adding || 'production' above, we ensure it always exists.
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }
  return v
}