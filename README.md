<p align="center">
  <img src="./public/img/icon.png" alt="Icon" width="100" />
</p>

<h1 align="center">灯 - Akari</h1>

<div align="center">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/sn0w12/Akari/build.yml">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/sn0w12/Akari">
    <img alt="License" src="https://img.shields.io/github/license/sn0w12/Akari">
</div>

Akari is a Next.js application designed to provide an enhanced manga reading experience for [Manganato](https://manganato.com/) users. It leverages Manganato as a backend, allowing users to manage and retain their bookmarks directly within the application.

# Features

-   **MyAnimeList Syncing:** Built-in synchronization with MyAnimeList (MAL).
-   **Seamless Manga Reading Experience:** Enjoy reading your favorite manga with a smooth interface.
-   **Bookmark Integration:** All your bookmarks are synced and saved, allowing you to pick up where you left off, using the Manganato bookmark system.
-   **All Manganato Features:** All normal manganato features are available.
-   **Remove Bookmarks on Manga Page:** Instead of having to find the manga in the bookmarks page, simply remove it from it's main page.
-   **Search Bookmarks:** Quickly find manga by searching through your bookmarks.

# Settings

-   **Fetch MAL Image:** Uses the public `jikan` and `MalSync` APIs to fetch better cover images from MyAnimeList.
-   **Use Toasts:** Enable or disable notification toasts.
-   **Fancy Animations:** Toggle advanced animations for a richer experience.

# Getting Started

## Online Usage

Visit the [Akari Website](https://akari-psi.vercel.app/) to start reading manga instantly.

If you have a [Manganato](https://manganato.com/) account, press the account button in the top right and sign in to your account as normal.

![Login](https://i.imgur.com/FqBrXCJ.png)

After you've been logged in, you can use it as you normally would.

<details>
  <summary>Showcase of Pages</summary>

### Front Page

![FrontPage](https://i.imgur.com/4c5yLKB.png)

### Bookmarks

![Bookmarks](https://i.imgur.com/Jub6Dbg.png)

### Manga

![Manga](https://i.imgur.com/1zyTaW1.png)

### Genre

![Genre](https://i.imgur.com/AxchlG8.png)

</details>

## Local Installation

If you prefer to run Akari locally, follow these steps.

### Prerequisites

Before running Akari, make sure you have the following installed:

-   [Node.js](https://nodejs.org/) (v14 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sn0w12/manga-reader
cd manga-reader
```

2. Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

or

```bash
yarn dev
```

Open http://localhost:3000 in your browser to see the application.

### Production Build

To build the app for production:

```bash
npm run build
npm run start
```

or

```bash
yarn build
yarn start
```

## DMCA disclaimer

The developers of this application do not have any affiliation with the content available in the app.
It collects content from sources that are freely available through any web browser
