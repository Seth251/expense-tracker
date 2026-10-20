# Pocketwise — Expense Tracker

A clean, mobile-first, **offline-ready personal finance web app**. Built with HTML, CSS and plain JavaScript. No sign-in, database server, npm install, subscriptions, or API keys required.

## What's included

| Page | Working features |
|---|---|
| Dashboard | Financial summary, income/expense charts, category breakdown, latest activity, budgets, quick entry, switch months, rename and reorder widgets |
| Transactions | Multi-item purchase entry with item name, price, date, running sum, review/confirm; add, edit, duplicate, remove, bulk-delete, search, filter, sort, payment methods, categories, dates, notes and tags |
| Budgets | Enter a budget amount and optional money-received date, automatically subtract all matching saved expenses regardless of date, show remaining money and over-budget warnings; optional category-specific budgets |
| Analytics | Today, week, month, year, all time, custom range; category chart, cash-flow chart and spending insights |
| Savings | Create/edit goals, deposits and withdrawals, history, progress tracking; transfers excluded from income and expenses |
| Templates | Edit/add/copy/delete transaction shortcuts, report presets, budget starters and savings starters |
| Reports | All Purchases & Expenses itemized by date, item name, original price/currency, category, payment method, notes and tags; complete multipage PDF, filtered financial/budget/savings reports, CSV and .xlsx |
| Settings | USD/KHR, custom exchange rate, theme, accent color, editable dashboard labels, category icons/colors, payment methods, recurring schedules, JSON backup/restore, CSV import, complete reset |

**Works offline after the initial online visit and installation** when served over HTTPS, such as GitHub Pages. Charts and document exports are built into the app, so no external chart/PDF/Excel libraries need to load at runtime.

## Record several purchased items at once

1. Choose **Add purchases** in the header or tap the **+** button on your phone. You can also use **List my purchases** on the Dashboard.
2. Enter the **item name**, **price**, **purchase date** and category for your first item.
3. Tap **Add another item** for as many rows as you need (up to 100). Choose the currency and payment method above the list.
4. Watch the **running total** update as you type.
5. Tap **Review purchases** for a clear list and grand total. Select **Back to edit** to make changes.
6. Tap **Save items** only after everything looks right. Each item will be saved separately in Transactions and included in analytics and reports.

Nothing is saved until you confirm the review. Existing single-transaction income entry, budget tracking, savings goals and export functions are still available.

## Important things to know

- Data is stored **on this device, in this browser**, primarily in IndexedDB with a LocalStorage fallback. There is **no account and no automatic sync** between devices.
- Export a **JSON backup** regularly. Clearing browser data, reinstalling Safari, or certain storage cleanup operations can erase your records. For restore: **Settings → Import JSON backup**.
- USD and KHR are supported. The default exchange rate is a **manually editable example**, not a live exchange-rate feed. USD balances use the exchange rate configured in Settings.
- Money is stored as integer units (USD cents and KHR riel) and savings are transfers, not expenses.
- The built-in one-click downloadable PDF uses a Latin font. For Khmer characters, open **Reports → Print / Save as PDF** in a browser with Khmer font support.
- This is a private, single-user static website. For encrypted remote backups, automatic sync, or multi-user accounts, a backend would be required.

## How to use it on your computer

You can look at `index.html`, but for reliable storage, service workers and installation **run it over HTTP/HTTPS**, rather than opening it directly as a `file://` URL.

With Python installed:

```bash
cd Pocketwise
python -m http.server 8000
```

Open **http://localhost:8000** in Chrome, Edge, or Safari. On Windows, try `py -m http.server 8000` if the `python` command is unavailable.

## Publish for free with GitHub Pages

1. Sign in to [github.com](https://github.com).
2. Click **New repository**. Name it `pocketwise` and choose **Public**.
3. Click **Add file → Upload files** (or upload with Git). Upload the **contents** of this folder, keeping `index.html`, `sw.js`, `manifest.webmanifest` and `assets` together at the repository root.
4. Commit your changes.
5. Go to **Settings → Pages** in the repository.
6. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
7. Wait for GitHub Pages to publish. Your site will have a URL similar to `https://YOUR_USERNAME.github.io/pocketwise/`.
8. Open the public URL on your phone. No hosting fee and no Netlify required.

To publish an update, commit new files and bump the `CACHE` version string in `sw.js` (for example, `pocketwise-v2`) so the browser refreshes its saved app assets.

## Install on your iPhone

1. Open your published HTTPS website in **Safari**.
2. Tap **Share** (square with upward arrow).
3. Choose **Add to Home Screen** (or **Open as Web App**, depending on iOS).
4. Confirm. Open **Pocketwise** from your Home Screen.
5. Visit the app at least once while online, so the offline app shell can be cached.

On Android Chrome: browser menu → **Install app** or **Add to Home screen**.

## Suggested first use

1. Open **Settings**, choose USD or KHR, adjust the exchange rate, and personalize your app name.
2. Add an **income** transaction (or an income entry representing your initial balance).
3. Add some **expenses** in Transactions, or use a quick-add template on the Dashboard.
4. Set your monthly budget and create a savings goal.
5. Use **Reports** to export a PDF or **Settings** to save a JSON backup.

## Folder structure

```text
Pocketwise/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── app.js
    └── icons/
        ├── icon.svg
        ├── icon-192.png
        ├── icon-512.png
        └── apple-touch-icon.png
```

## Notes for developers

- `assets/js/app.js`: model, persistence, calculations, views, dialogs, imports/exports and event handling.
- `assets/css/styles.css`: responsive desktop/mobile UI, light/dark color tokens, print layout.
- `sw.js`: offline app caching. Bump `CACHE` when shipping new versions.
- `manifest.webmanifest`: Home Screen installation and icons.
- Reports and Excel work without network libraries: exports are generated locally using a small PDF writer and an uncompressed `.xlsx` ZIP writer.
- Use browser developer tools for debugging; no build step is needed.

**Privacy reminder:** If you host the files in a public GitHub repository, only source code is public. Your browser-stored transactions are *not* automatically uploaded to GitHub. Do **not** commit JSON backup files containing your actual financial records.

## Automatic budget calculations

Open **Budgets → Add budget** and enter a budget amount and optional date you received the money. Pocketwise automatically sums **all saved expenses** (including individual multi-item purchases) and subtracts them from your budget amount, regardless of transaction date. The date is informational only and does not reset calculations. Category-specific budgets only count expenses in the selected category; “All expenses” counts every expense. Income and savings transfers are excluded from expense totals.

**Example:** $500 budget − $120 recorded expenses = **$380 remaining**. If you add another $15 purchase, remaining updates to $365 automatically. Existing budget records remain saved and use the new calculation.

## Download a complete itemized expense report

Open **Reports** and select **All purchases & expenses (itemized)**. The default reporting period is **All time**, so every saved expense is listed separately, including items added together in the multi-item purchase form. The downloaded PDF includes the purchase date, full item name or transaction description, original price and currency, expense category, payment method, notes and tags when entered, and a total expense summary. Long item descriptions or notes wrap onto additional lines and long reports continue onto multiple pages. The report's expense total is converted into the display currency selected in Settings.

For a PDF of absolutely **all purchases regardless of report filters**, click **All purchases PDF** on Reports or Transactions. Financial reports retain their optional date and type filters. Budget and savings PDFs include an all-purchases appendix. Reports are generated from saved entries on your device; no example data is inserted.

## Custom report dates (September and later)

On **Reports → Reporting period**, select **Custom range**. Pick **From** (for example 2026-09-14) and **To** (for example 2026-10-21), and tap **Apply date range**. Both boundary dates are included. The preview and **Download current PDF**, **CSV**, and **Excel** then use the same validated custom range. In iPhone Safari, a date picker is not refreshed while you are still selecting a date.

An **All purchases PDF** button intentionally exports the complete expense history without applying the date filter. The Reports page now shows how many saved expenses exist on this device and the earliest/latest saved purchase dates. Use **View all saved expense entries** to open Transactions with **All time** and **Expenses** selected. If a September item is missing there, the report cannot retrieve it from another device or browser. The budget's money-received/start date does not itself create income or purchase records.



## First balance and remaining balance in reports

The **Reports** page now shows **First Balance**, **Expenses in Report**, and **Remaining Balance**, both in the on-screen preview and downloaded PDFs. Choose **First balance from budget** to select one of your saved budgets (automatically chooses an all-expenses budget where possible); selecting a budget does not create or modify income or expense transactions.

**First Balance** = amount entered for that saved budget. **Expenses in Report** = expenses included by the currently selected reporting period and category filters (for example Sep 14 through Oct 21, inclusive). **Remaining Balance** = First Balance − Expenses in Report. For the unfiltered **All purchases PDF**, expenses cover all saved purchase dates. Income is not added twice. If no budget exists, First Balance and Remaining Balance are shown as unavailable, instead of assuming zero. A budget's money-received/start date is displayed for reference and is not an expense filter.

Examples: First Balance USD 500; itemized expenses USD 125; Remaining Balance USD 375. These values are converted into the preferred report currency, with original purchase currencies retained in the item list.
