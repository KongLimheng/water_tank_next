# Settings State Management & Enhanced About Page - Implementation Guide

## Overview
This implementation adds a centralized settings state management system using React Context that fetches settings once at the public layout level and provides them to all public-facing pages.

## Changes Made

### 1. **Created Settings Context** (`src/contexts/SettingsContext.tsx`)
- Centralized state management for site settings
- Fetches settings once on mount and caches them
- Provides `useSettings()` hook for access across components
- Includes error handling and refetch capability

### 2. **Updated Public Layout** (`src/app/(public)/layout.tsx`)
- Wrapped with `SettingsProvider` to enable settings across all public routes
- Settings are fetched once at the layout level for optimal performance
- All child components can access settings via `useSettings()` hook

### 3. **Enhanced About Page** (`src/app/(public)/about/page.tsx`)
- Converted to client component using `useSettings()` hook
- Enhanced design with:
  - Modern gradient backgrounds and color schemes
  - Improved typography and spacing
  - Better visual hierarchy
  - Smooth animations and transitions
  - Loading states with skeleton components
  - Contact section with settings data

### 4. **Updated Components**
- **Hero Component**: Now uses `useSettings()` instead of React Query
- **Footer Component**: Now uses `useSettings()` instead of React Query
- **Home Page**: Enhanced with additional sections and CTAs using settings context

### 5. **Created Utility Files**
- `src/lib/utils.ts`: Utility function for classname merging
- `src/components/ui/skeleton.tsx`: Loading skeleton component

## How to Use Settings Across Pages

### In Any Public Page Component:

```tsx
'use client'

import { useSettings } from '@/contexts/SettingsContext'

export default function MyPage() {
  const { settings, isLoading, error } = useSettings()

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <h1>{settings?.aboutUs.section1.title}</h1>
      <p>{settings?.phone}</p>
      <p>{settings?.email}</p>
      {/* Use any settings data here */}
    </div>
  )
}
```

### Available Settings Data:
```typescript
settings = {
  phone: string
  email: string
  address: string
  mapUrl: string
  facebookUrl: string
  youtubeUrl: string
  banners: BannerItem[]
  aboutUs: AboutUsData {
    section1: { image?, content?, imageFile? }
    section2: AboutUsItem[]
    section3: {
      description?
      items: AboutUsSection3Item[]
      qualityImage?, qualityTitle?, qualityDescription?
      certificateImage?, certificateTitle?, certificateDescription?
    }
  }
}
```

## Benefits of This Approach

1. **Single Point of Fetch**: Settings are fetched once at the layout level
2. **Global Access**: All public pages can access settings without additional API calls
3. **Consistent State**: Guaranteed same data across all places
4. **Error Handling**: Built-in error handling and loading states
5. **Performance**: Reduces unnecessary API calls and provides caching
6. **Refetch Capability**: Can manually refetch if needed

## File Structure

```
src/
├── contexts/
│   └── SettingsContext.tsx          (NEW)
├── components/
│   ├── Footer.tsx                   (UPDATED)
│   ├── Hero.tsx                     (UPDATED)
│   └── ui/
│       └── skeleton.tsx             (NEW)
├── lib/
│   └── utils.ts                     (NEW)
├── app/
│   └── (public)/
│       ├── layout.tsx               (UPDATED)
│       ├── page.tsx                 (UPDATED)
│       ├── about/
│       │   └── page.tsx             (UPDATED)
│       ├── products/
│       ├── videos/
│       └── shop/
```

## Important Notes

### Required Dependencies
Make sure these packages are installed:
- `clsx` - For classname concatenation
- `tailwind-merge` - For Tailwind CSS class merging

If not installed, run:
```bash
npm install clsx tailwind-merge
```

### Migration from React Query
The following components have been migrated from using React Query to the Context:
- Footer.tsx
- Hero.tsx

This reduces redundant API calls and improves performance.

### Design Enhancements

The About page now features:
- **Section 1**: Hero section with title, description, and image
- **Section 2**: Product lines grid with hover effects
- **Section 3**: Quality & Certifications section with dark theme
- **Contact CTA**: Call-to-action section with contact information

## Color Scheme

The design uses a professional blue color palette:
- Primary: `blue-600` to `blue-700`
- Backgrounds: `slate-50` to `slate-900`
- Accents: Gradients for visual interest
- Hover effects: Scale and shadow transitions

## Responsive Design

All sections are fully responsive with:
- Mobile-first approach
- Tablet optimizations
- Desktop enhancements
- Proper spacing and padding scales

## Next Steps

You can further enhance:
1. Add more sections to the About page
2. Create custom hooks for specific settings data
3. Add caching strategies for better performance
4. Add loading optimizations with Suspense boundaries
5. Implement settings update notifications

## Troubleshooting

### Context Not Available
Make sure component has `'use client'` directive and is within `SettingsProvider`

### Settings Undefined
Check that the settings API is returning correct data structure

### Type Errors
Ensure `SiteSettings` type is properly imported from `@/types`

## Example: Creating a Custom Hook

```tsx
// src/hooks/useAboutUs.ts
import { useSettings } from '@/contexts/SettingsContext'

export function useAboutUs() {
  const { settings, isLoading } = useSettings()
  
  return {
    aboutUs: settings?.aboutUs,
    isLoading,
    section1: settings?.aboutUs.section1,
    section2: settings?.aboutUs.section2,
    section3: settings?.aboutUs.section3,
  }
}
```

Then use in components:
```tsx
const { section1, section2, section3 } = useAboutUs()
```
