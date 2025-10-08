<p align="center">
  <img src="./images/AkariGradient.png" alt="Icon" width="450" style="border-radius: 12px" />
</p>

<h1 align="center">灯 - Akari</h1>

<div align="center">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/sn0w12/Akari/build.yml">
    <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/sn0w12/Akari">
    <img alt="Version" src="https://img.shields.io/badge/version-1.3.3-indigo">
    <img alt="License" src="https://img.shields.io/github/license/sn0w12/Akari">
</div>

Akari is a Next.js application designed to provide an enhanced manga reading experience for [Manganato](https://manganato.gg/) users. It leverages Manganato as a backend, allowing users to manage and retain their bookmarks directly within the application.

## Table of Contents

-   [Features](#features)
-   [Settings](#settings)
-   [Technical Stack](#technical-stack)
-   [Getting Started](#getting-started)
    -   [Online Usage](#online-usage)
    -   [Local Installation](#local-installation)

# Features

## Reader Experience

-   **Enhanced Reading Interface:** Clean, modern UI optimized for manga reading
-   **Multiple View Modes:** Support for both individual page reading for manga and list reading for manhwa.
-   **Responsive Design:** Fully responsive interface that works on mobile and desktop

## Manga Management

-   **Genre Filtering:** Browse manga by specific genres
-   **Popular Manga Section:** Discover trending and popular manga
-   **Latest Updates:** Stay informed about newly added chapters

## Bookmarks and Sync

-   **MyAnimeList Integration:**
    -   Sync with MyAnimeList (MAL) account
    -   Enhanced manga information from MAL
-   **Bookmark Management:**
    -   Sync bookmarks with Manganato account
    -   Quick bookmark removal from manga pages
    -   Search through bookmarked manga
    -   Up-to-date chapter tracking
    -   Last read chapter tracking

# Settings

## General

| Setting          | Default | Description                                           |
| ---------------- | ------- | ----------------------------------------------------- |
| Theme            | System  | Select the application theme.                         |
| Fancy Animations | Enabled | Such as manga detail pages cover image.               |
| Show Toasts      | Enabled | Show toast notifications for various actions.         |
| Login Toasts     | Enabled | Show warnings when you aren't logged in to a service. |

## Manga

| Setting            | Default | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| Show Page Progress | Enabled | Shows a progress bar at the side/ bottom when reading. |
| Strip Reader Width | 144     | Width of the strip reader.                             |

## Shortcuts

| Setting            | Default      | Description                 |
| ------------------ | ------------ | --------------------------- |
| Show Shortcuts     | Enabled      | Enable or disable shortcuts |
| Search Manga       | Ctrl+K       | Open manga search           |
| Toggle Sidebar     | Ctrl+B       | Toggle the sidebar          |
| Open Settings      | Ctrl+,       | Open settings               |
| Open Account       | Ctrl+.       | Open account page           |
| Navigate Bookmarks | Ctrl+Shift+B | Navigate to bookmarks       |

## Data

| Setting               | Default | Description                 |
| --------------------- | ------- | --------------------------- |
| Clear Cache           | N/A     | Clears all caches           |
| Clear Reading History | N/A     | Clears your reading history |

# Technical Stack

-   **Frontend**: Next.js 15, React 19, TailwindCSS
-   **Database**: Supabase integration for manga data
-   **Authentication**: Built-in Manganato authentication and MyAnimeList OAuth

# Getting Started

## Online Usage

Visit the [Akari Website](https://akarimanga.dpdns.org/) to start reading manga instantly.

If you have a [Manganato](https://manganato.gg/) account, press the account button in the top right and sign in to your account as normal.

![Login](./images/LoginForm.webp)

After you've been logged in, you can use it as you normally would.

<details>
  <summary>Showcase of Pages</summary>

### Front Page

![FrontPage](./images/Homepage.webp)

### Bookmarks

![Bookmarks](./images/Bookmarks.webp)

### Manga

![Manga](./images/Manga.webp)

### Author

![Author](./images/Author.png)

### Genre

![Genre](./images/Genre.webp)

</details>

## Local Installation

If you prefer to run Akari locally, follow these steps.

### Prerequisites

Before running Akari, make sure you have the following installed:

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sn0w12/Akari
cd Akari
```

2. Install dependencies:

If you are using yarn, replace npm with yarn.

```bash
npm install
```

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

> **Note**: When running locally, MyAnimeList authentication only works on specific localhost ports. Currently supported ports are: 3000, 3016, 3456, 3789, and 4000. You can modify the port in your `package.json` scripts by adding a `-p` flag with `next dev / start`.

Open http://localhost:3000 in your browser to see the application.

### Production Build

To build the app for production:

```bash
npm run build
npm run start
```

# DMCA disclaimer

The developers of this application do not have any affiliation with the content available in the app.
It collects content from sources that are freely available through any web browser
