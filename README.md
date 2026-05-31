# Wajha RoboticsEdu - Landing Page & Application

## Overview
Wajha RoboticsEdu is a playful, interactive web application serving as a landing page and functional portal for a robotics education academy. Built with vanilla HTML/JS and powered by Vercel serverless functions, the platform offers an intuitive interface tailored for parents and administrators.

## Newly Added Features

1. **Admin Dashboard & Blog System**:
   - Secure role-based access for administrators.
   - Create, edit, and delete blog posts.
   - Feature a single article which will be highlighted dynamically on the Home Page.

2. **Dynamic Achievements Page**:
   - Displays a paginated view (3 per page) of all blog/achievement posts.
   - Integrated call-to-action cards dynamically injected for enhanced user engagement.

3. **Parent Portal & Children Profiles**:
   - Parents can upload and manage profiles for their children (e.g., FLL or IQ programs) including image uploads.
   - The portal features the primary child and presents the information using an engaging glassmorphism UI.

4. **Automated Integration Testing**:
   - The project now includes Playwright for end-to-end (E2E) integration testing.
   - Tests cover client login workflows, admin blog post generation, achievements pagination, mobile responsiveness checks, and API role-based access.

5. **Vercel Routing & CORS Improvements**:
   - A `vercel.json` is configured to properly allow cross-origin resource sharing (CORS) for all `/api/*` endpoints and enforce clean URLs across the site.

## How to Use

### Running Locally
To run the project locally including the API endpoints, you need Vercel CLI installed:
```bash
npm i -g vercel
vercel dev
```

### Running Automated Tests
To run the newly added Playwright E2E tests:
```bash
npm install
npm run test:e2e
```
To run tests with the Playwright UI:
```bash
npm run test:e2e:ui
```

### Edge Cases and UI Reporting
- **Image Uploads**: Ensure Vercel Blob or your storage mechanism is fully configured via `.env` to prevent 500 errors during child creation.
- **Vercel Environments**: The local test environment currently stubs certain UI interactions. For complete visual validation of the playful aesthetics (like overlapping gradients and glassmorphism on mobile), deploy to a Vercel staging branch.
