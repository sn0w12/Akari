<p align="center">
  <img src="./images/AkariGradient.png" alt="Icon" width="450" style="border-radius: 12px" />
</p>

<h1 align="center">灯 - Akari</h1>

<div align="center">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/sn0w12/Akari/build.yml">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/sn0w12/Akari">
    <img alt="Version" src="https://img.shields.io/badge/version-2.0.0-indigo">
    <img alt="License" src="https://img.shields.io/github/license/sn0w12/Akari">
</div>

Akari is a high-quality, open-source manga reader built with Next.js. It provides an enhanced reading experience, allowing users to manage bookmarks and reading history seamlessly.

## Table of Contents

-   [Features](#features)
-   [Getting Started](#getting-started)
    -   [Online Usage](#online-usage)
    -   [Local Installation](#local-installation)
-   [Screenshots](#screenshots)

## Features

### Reader Experience

-   **Enhanced Reading Interface:** Clean, modern UI optimized for manga reading
-   **Multiple View Modes:** Support for both individual page reading for manga and list reading for manhwa
-   **Responsive Design:** Fully responsive interface that works on mobile and desktop

### Manga Management

-   **Genre Filtering:** Browse manga by specific genres
-   **Popular Manga Section:** Discover trending and popular manga
-   **Latest Updates:** Stay informed about newly added chapters

### Bookmarks and Sync

-   **External Service Integration:** Sync with MyAnimeList (MAL) and AniList accounts to import your saved manga
-   **Bookmark Management:** Save, organize, and track your favorite manga titles with up-to-date chapter progress

## Getting Started

### Online Usage

Visit the [Akari Website](https://akarimanga.dpdns.org/) to start reading manga instantly.

### Local Installation

If you prefer to run Akari locally, follow these steps. Logging in is currently not supported when running locally, I am looking into solutions.

#### Prerequisites

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

#### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sn0w12/Akari
    cd Akari
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

    > **Note:** MyAnimeList authentication only works on specific localhost ports: 3000, 3016, 3456, 3789, and 4000. Modify the port in `package.json` scripts if needed.

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

#### Production Build

To build for production:

```bash
npm run build
npm run start
```

## Screenshots

### Front Page

![FrontPage](./images/Homepage.webp)

### Bookmarks

![Bookmarks](./images/Bookmarks.webp)

### Manga

![Manga](./images/Manga.webp)

### Author

![Author](./images/Author.webp)

### Genre

![Genre](./images/Genre.webp)

</details>

## Disclaimer

The developers of this application do not have any affiliation with the content available in the app. It collects content from sources that are freely available through any web browser.
