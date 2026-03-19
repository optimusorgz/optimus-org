# OPTIMUS - Event Management Platform Refactoring Guide

## 1. Project Structure Analysis

The current `optimus-org` project has a functional Next.js 16 (App Router) structure. However, it currently suffers from several organizational and architectural issues that make it difficult to maintain and onboard new developers. 

**Major Problems Identified:**
- **Scattered Components:** Components are deeply nested arbitrarily. For example, `components/dashboard/hostevent` has highly specific forms mixed with general UI components.
- **Flat API Structure:** API routes like `create-order` and `send-email` are directly under `app/api/`, lacking a structured domain grouping (e.g., `app/api/payments/`, `app/api/notifications/`).
- **Inconsistent Grouping by Feature vs. Type:** Some folders are grouped by type (e.g., `app/form`, `app/event-page`), while others are grouped by feature (e.g., `app/payment`, `app/posts`).
- **Proliferation of Small Files:** There are numerous small files under `hooks/`, `lib/`, and `components/ui/` that could be logically grouped together to avoid unnecessary imports and directory verbosity.
- **Misplaced Logic:** Client-focused or domain-specific logic resides in general folders instead of near where it is used.

## 2. Key Structural Problems

- **Feature Fragmentation:** Code related to a specific feature (like "Events" or "Organizations") is broken across `app/`, `components/`, and `lib/types/`. A new developer has to jump between 3-4 deep directories to understand one feature.
- **Overcrowded UI Components:** `components/ui/` contains over 40 individual files mostly from shadcn/ui. While standard, they clutter the root component directory.
- **Redundant Page Wrappers:** Files like `app/admin-dashboard/[user_id]/AdminDashboardClient.tsx` alongside an empty `page.tsx` suggest unnecessary component splitting or incomplete refactoring.
- **Unorganized Types:** `lib/types/` has definitions that strictly belong to specific features. For instance, `datatable.ts` only matters for `components/admin-dashboard/DataTable.tsx`.

## 3. Proposed Folder Structure

Transition to a feature-driven architecture while maintaining Next.js App Router conventions:

```text
src/
├── app/                  # Next.js App Router (Routing Only)
│   ├── (auth)/           # Grouped auth routes: login, signup, reset-password, callback
│   ├── (dashboard)/      # Grouped user/admin dashboard routes
│   ├── api/              # API Endpoints
│   │   ├── payments/     # e.g., create-order
│   │   └── emails/       # e.g., send-email
│   ├── events/           # Event browsing, details, registration
│   └── organizations/    # Organization view and registration
├── components/           # Reusable UI & Application Components
│   ├── common/           # Navbars, footers, wrappers (Auth.tsx)
│   ├── features/         # Complex, feature-specific components (e.g., EventCard, TicketScanner)
│   └── ui/               # Base UI elements (buttons, inputs - keep as is if using shadcn)
├── features/             # Business Logic Grouped by Domain
│   ├── events/           # All event-related logic: hooks, services, sub-components
│   ├── admin/            # Admin dashboard specific logic (CRUDForm, DataTable)
│   ├── organizations/    # Organization specific logic
│   └── auth/             # Authentication logic (useAuth.tsx)
├── services/             # External Integrations (Supabase, Razorpay, Nodemailer)
├── hooks/                # Global Custom Hooks (use-toast, useAnimateOnVisible)
├── utils/                # General Helpers (formatting, calculations)
├── config/               # Constants, environment variables, theme configs
├── lib/                  # Core Library Setup (Supabase client wrapper)
└── types/                # Global TypeScript Definitions
```

## 4. File Merge Instructions

To reduce cognitive load and file jumping, merge the following excessively small or strictly related files:

**Merge the following type definitions:**
- `lib/types/datatable.ts`
- `lib/types/react-qr-code.d.ts`
- `lib/types.ts`
**Into:** `types/index.ts` (or `types/common.ts`)
**Reason:** These contain very small, global type definitions that do not justify their own files.

**Merge the following dynamic form utilities:**
- `lib/dynamicForm.ts`
- `lib/formBuilder.ts`
**Into:** `features/events/utils/formBuilderHelpers.ts`
**Reason:** Both heavily relate to the dynamic event form building process and should be consolidated into the event feature logic.

**Merge the following context and auth hooks:**
- `context/UserContext.tsx`
- `components/context/authprovider.tsx`
- `hooks/useAuth.tsx`
**Into:** `features/auth/AuthContext.tsx`
**Reason:** They all handle the same domain (User Session/Authentication) and merging them reduces context providers and simplifies imports.

**Merge these small UI utility hooks:**
- `hooks/use-toast.ts`
- `components/ui/toast.tsx` (if it strictly exports the hook alongside minimal UI wrapper)
**Into:** `components/ui/use-toast.tsx`
**Reason:** Keeping the toast logic and its direct UI definition together prevents orphaned hook files.

## 5. File Split Instructions

Certain files act as "God components" and should be broken down for readability:

- **Split:** `app/event-page/event-details/EventDetailsClient.tsx` (~600 lines)
  - **Proposed Split:** 
    - `EventHeader.tsx` (Banner, title, date)
    - `EventDescription.tsx` (Main content)
    - `EventRegistrationCTA.tsx` (Pricing and register button logic)
  - **Reason:** 596 lines is too large for a client component. Separating visual components from the data-fetching/state-management wrapper makes it easier to test and modify.

- **Split:** `app/home/page.tsx` (~630 lines)
  - **Proposed Split:** Extract sections like `HeroSection.tsx`, `FeaturedEvents.tsx`, `Testimonials.tsx`, or `CallToAction.tsx` into `components/features/home/`.
  - **Reason:** The landing page should just compose smaller, reusable sections rather than defining all layout and content in one massive file.

- **Split:** `app/form/create-event/page.tsx` (~430 lines)
  - **Proposed Split:** Separate the complex state management (form schema, submit handlers) into a custom hook (e.g., `useCreateEvent.ts`) and split the UI into `BasicDetailsForm.tsx`, `TicketPricingForm.tsx`.
  - **Reason:** Form management combined with complex UI makes the file hard to debug.

## 6. File Rename Suggestions

Rename files to clearly reflect their business responsibility and standard conventions:

- **Change:** `api/client.js`
  **To:** `services/supabaseClient.ts`
  **Reason:** Clarifies what the client is for and ensures it uses TypeScript like the rest of the project.

- **Change:** `components/navbar/page.tsx`
  **To:** `components/common/TopNavbar.tsx`
  **Reason:** Avoid using Next.js reserved words (`page.tsx`) for standard components. It confuses the App Router mental model.

- **Change:** `app/checked_in/[event_id]/page.tsx`
  **To:** `app/events/[event_id]/check-in/page.tsx`
  **Reason:** Follows RESTful routing practices. Check-in is a sub-action of a specific event.

- **Change:** `components/dashboard/hostevent/EventEditForm.tsx`
  **To:** `features/events/components/EventEditForm.tsx`
  **Reason:** Groups the event editing component under the Events feature domain rather than a generic dashboard folder.

## 7. File Relocation Instructions

Move files to their proper domain folders:

- **Move:** `lib/email.ts`
  **To:** `services/emailService.ts`
- **Move:** `app/api/create-order/route.ts`
  **To:** `app/api/payments/razorpay/route.ts`
- **Move:** `components/ticket/TicketScanner.tsx`
  **To:** `features/events/components/TicketScanner.tsx`
- **Move:** `components/admin-dashboard/*`
  **To:** `features/admin/components/`
- **Move:** `app/reset-password`, `app/auth/callback`
  **To:** `app/(auth)/reset-password`, `app/(auth)/callback`

## 8. Import Fix Instructions

After executing the structural changes, you will need to update import paths across the project. To make this easier:

1. **Update `tsconfig.json` path aliases:**
   Ensure you configure absolute imports to avoid relative path hell (`../../../../`):
   ```json
   "compilerOptions": {
     "baseUrl": ".",
     "paths": {
       "@/*": ["src/*"],
       "@components/*": ["src/components/*"],
       "@features/*": ["src/features/*"],
       "@services/*": ["src/services/*"]
     }
   }
   ```
2. **Search and Replace:**
   - Find all instances of `import { ... } from '@/lib/types...'` and replace with `import { ... } from '@/types/...'`.
   - Update shadcn component imports from `@/components/ui/...` to wherever they end up if moved, though keeping them at `@/components/ui/` is standard and requires no changes.
   - Any imports pointing to `api/client.js` must be updated to `@/services/supabaseClient`.

## 9. Developer Maintainability Improvements

Implementing this refactoring guide will yield the following benefits for onboarding a new developer:

1. **Clear Boundaries (Domain-Driven):** By moving from a flat "all components in one folder" approach to a `features/` based architecture, the new developer knows exactly where to look when modifying the "Events" logic without tripping over "Admin" or "Authentication" logic.
2. **Reduced Cognitive Load:** Splitting massive 600+ line files (like `EventDetailsClient.tsx` and `page.tsx` for Home) means the developer only has to understand small, isolated chunks of logic at a time to fix a bug or add a feature.
3. **Easier Debugging:** Merging redundant type files and abstracting the Supabase client into a dedicated `services/` directory makes tracing data flows and type errors much simpler.
4. **Adherence to Next.js App Router Standards:** Removing arbitrary folders in `app/` and grouping routes (like `(auth)`) prevents URL segment bloat and makes the actual user-facing routing table instantly readable.
