# Future Features

Ideas and features to revisit later.

---

## Email Authentication

**Status**: Deferred
**Priority**: Medium
**Current**: Google OAuth only

### Recommendation: Magic Link (Passwordless)

User enters email → receives login link → clicks to authenticate. No passwords to remember or reset.

### Implementation Steps

1. **Resend account** - Sign up at resend.com (free tier: 3,000 emails/month)
2. **Domain verification** - Add DNS records for your sending domain
3. **Environment variable** - Add `AUTH_RESEND_KEY` to Convex
4. **Update auth config** - Add Resend provider to `convex/auth.ts`
5. **UI updates** - Add email input field to login screen
6. **Verification flow** - Handle the magic link callback

### Files to Modify

- `convex/auth.ts` - Add Resend provider
- `src/components/SignInButton.tsx` - Add email input option

### Reference

- Convex Auth docs: https://labs.convex.dev/auth/config/passwords
- Resend: https://resend.com

---

## Recipe Card Scanner & Printer

**Status**: Idea
**Priority**: Low/Future
**Current**: No recipe storage beyond meal plans

### Overview

Digitize physical recipe cards and create a searchable recipe library. Users can scan old 3x5 index cards, view them as beautiful digital recipe cards on their phone, and print them back onto physical cards when needed.

### Key Features

1. **Scanner** - Use camera to capture recipe cards, OCR to extract text
2. **Digital Library** - Browse recipes as styled "recipe cards" on phone
3. **Search & Organization** - Sort by category, easily searchable
4. **Print Multiple Formats**:
   - Individual 3x5 index cards
   - Multiple recipes per sheet on card stock (for cutting)
   - Standard 8.5x11 printable format
5. **Export** - Save recipe cards as photos to camera roll

### Potential Implementation

1. **OCR Integration** - Use service like Tesseract.js or Cloud Vision API
2. **Database Schema** - Add `recipeCards` table with fields:
   - `title`, `ingredients`, `instructions`
   - `category`, `tags`, `imageUrl`
   - `originalScan` (photo of physical card)
3. **UI Components**:
   - Camera/upload interface
   - Recipe card viewer with print-friendly CSS
   - Category browser and search
4. **Print Service** - Generate print-optimized PDFs with proper 3x5 dimensions

### Files to Create

- `src/app/recipe-library/` - New section
- `convex/recipeCards.ts` - Schema and mutations
- `src/components/RecipeCardScanner.tsx`
- `src/components/RecipeCardViewer.tsx`

### Technical Considerations

- OCR accuracy may need manual correction UI
- Print layout requires precise CSS for physical card dimensions
- Image storage (Convex file storage vs. external service)
- Recipe schema should be flexible (not all recipes follow same format)

---

*Add more future features below as needed*
