# Mortgage Calculator

React + TypeScript mortgage calculator with amortization schedule, extra-payment modeling, and export options.

## Features

- Monthly payment + payoff date + interest saved (vs no extra payments)
- Full amortization schedule grouped by loan year
- Export: CSV
- Export/Print: real PDF via `@react-pdf/renderer`
- Saved scenarios (in-page): save + apply from a dropdown on the calculator page
- Scenario names are unique: saving with the same name updates that scenario
- Optional: Sign in with Google (Firebase) to sync saved scenarios across devices

## Setup

Install the dependencies:

```bash
npm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000).

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Firebase (optional)

This app can optionally enable **Google login** and **cloud-synced scenarios** using Firebase Auth + Firestore.

1. Create a Firebase project and add a Web app.
2. Enable **Authentication → Sign-in method → Google**.
3. Create a Firestore database.
4. Add a local env file (copy from `.env.example`) and fill in:

```bash
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_FIREBASE_AUTH_DOMAIN=...
PUBLIC_FIREBASE_PROJECT_ID=...
PUBLIC_FIREBASE_APP_ID=...
```

If Firebase env vars are not set, the app still runs; the sign-in button is hidden.

## Styling / theme

- Tailwind v4 is imported via `src/App.css`.
- The app is migrating toward centralized theme tokens (`--mc-*`) defined in `src/App.css` under `:root` and `.dark`.
- The optional `.mc-shell` class provides a warm “paper + subtle grid” background.
- To change the primary brand color (e.g. use Tailwind `sky`), edit `--mc-brand`, `--mc-brand-hover`, and `--mc-focus` in `src/App.css`.

### Scenario syncing behavior

- Scenarios are stored in Firestore at `users/{uid}` under a `scenarios` array.
- Writes are debounced (~600ms) to avoid spamming Firestore while you type.
- A small status pill in the header shows `Saving…` / `Synced` / `Sync error` after the first write.
  - On error, hover the pill to see the Firebase error string.

### Firestore security rules (recommended)

Store scenarios under `users/{uid}` and restrict access to the signed-in user:

```js
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /users/{uid} {
			allow read, write: if request.auth != null && request.auth.uid == uid;
		}
	}
}
```

## Learn more

## Documentation

- Customer guide: [arch-docs/USER_GUIDE.md](arch-docs/USER_GUIDE.md)
- Technical overview: [arch-docs/TECHNICAL_OVERVIEW.md](arch-docs/TECHNICAL_OVERVIEW.md)
- Diagrams (Mermaid): [arch-docs/DIAGRAMS.md](arch-docs/DIAGRAMS.md)

To learn more about Rsbuild, check out the following resources:

- [Rsbuild documentation](https://rsbuild.rs) - explore Rsbuild features and APIs.
- [Rsbuild GitHub repository](https://github.com/web-infra-dev/rsbuild) - your feedback and contributions are welcome!
