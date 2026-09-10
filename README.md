# Al-Qur'an — Efektif

A modern Qur'an reader built around a simple idea:

**Read one ayah at a time, with a smooth vertical scrolling experience inspired by modern short-form feeds.**

Instead of endlessly scrolling through social media, scroll through the words of Allah.

## ✨ Features

### Vertical Ayah Feed

Switch to **Scroll mode** to read the Qur'an one ayah at a time in a full-height vertical feed.

* Swipe or scroll vertically between ayat
* One ayah takes focus at a time
* Current ayah indicator
* Smooth navigation
* Reading progress is remembered
* Audio can automatically move the reader to the currently playing ayah

The interaction may feel familiar if you've used apps such as TikTok, Reels, or Shorts — but the content and purpose are completely different.

### Two Reading Modes

Choose whichever reading experience you prefer:

**Mushaf**

A traditional continuous reading layout with multiple ayat on the page.

**Scroll**

A focused, full-height ayah-by-ayah reading experience.

You can switch between them at any time.

## 📖 Qur'an Reader

Includes:

* Arabic Qur'an text
* Indonesian translation from **Kementerian Agama RI**
* English translation from **Saheeh International**
* Surah navigation
* Juz navigation
* Direct links to specific ayat
* Bismillah display
* Makkiyah / Madaniyah information
* Surah metadata

## 🎧 Ayah Audio

Listen to individual ayat directly from the reader.

The audio player supports ayah-level playback and integrates with the Scroll reading experience.

When audio advances to another ayah, Scroll mode can follow along automatically.

## 🔖 Bookmarks & Reading Progress

Keep track of your reading without needing an account.

* Bookmark ayat
* Remember the last viewed ayah
* Continue reading where you stopped
* Track reading activity locally

## 🔎 Search

Search through Qur'an content and quickly navigate to relevant ayat.

## 🕌 Prayer Times

The application also includes prayer-time information based on the user's location.

## 📅 Al-Kahf Reminder

A built-in reminder helps surface Surah Al-Kahf at the appropriate time.

## 📱 Installable PWA

Al-Qur'an — Efektif is built as a Progressive Web App.

You can install it on supported mobile and desktop devices and use it more like a native application.

## 🛠 Tech Stack

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **Zustand**
* **Vitest**
* **Playwright**
* **Oxlint**
* **Oxfmt**
* **pnpm**
* **Cloudflare Pages**

## 🚀 Getting Started

### Requirements

* Node.js
* pnpm

### Install

```bash
git clone https://github.com/efektif/quran.git

cd quran

pnpm install
```

### Start the development server

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## 🧪 Development

Run linting:

```bash
pnpm lint
```

Run type checking:

```bash
pnpm typecheck
```

Run unit tests:

```bash
pnpm test
```

Run end-to-end tests:

```bash
pnpm test:e2e
```

Run the main verification suite:

```bash
pnpm verify
```

Or run everything, including Playwright:

```bash
pnpm verify:full
```

## 📦 Build

```bash
pnpm build
```

## ☁️ Deployment

The project supports deployment to **Cloudflare Pages**.

```bash
pnpm deploy
```

By default, the Cloudflare Pages project name is:

```text
efektif-quran
```

It can be overridden using:

```bash
CLOUDFLARE_PAGES_PROJECT=your-project pnpm deploy
```

## 💡 Why this project?

Modern applications have made scrolling frictionless.

Unfortunately, that frictionless experience is often optimized to keep us consuming content indefinitely.

This project experiments with applying a familiar interaction pattern to something more meaningful:

> **What if opening the Qur'an felt as effortless as opening your favorite feed?**

No complicated navigation.

No need to decide how much to read.

Open it, read an ayah, and continue scrolling.

Even a few ayat are better than none.

## 🤝 Contributing

Contributions are welcome.

If you find a bug, have an accessibility improvement, notice an issue with the reading experience, or have an idea that can help people read the Qur'an more easily, feel free to open an issue or pull request.

When contributing to Qur'an text, translations, or religious content, please take extra care to preserve the accuracy and integrity of the source material.

## 📜 License

See the repository license for details.

---

<p align="center">
  <strong>Scroll less aimlessly. Read one more ayah.</strong>
</p>
