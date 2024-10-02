<p align="center">
  <img src="./public/img/icon.png" alt="Icon" width="100" />
</p>

<h1 align="center">灯 - Akari</h1>

Akari is a Next.js application designed to provide an enhanced manga reading experience for [Manganato](https://manganato.com/) users. It uses manganato as a backend, leveraging its content while allowing users to manage and retain their bookmarks from the site directly within the application.

# Features

- **Seamless Manga Reading Experience:** Enjoy reading your favorite manga with a smooth interface.
- **Bookmark Integration:** All your bookmarks are synced and saved, allowing you to pick up where you left off, using the Manganato bookmark system.
- **All Manganato Features:** All normal manganato features are available.
- **Remove Bookmarks on Manga Page:** Instead of having to find the manga in the bookmarks page, simply remove it from it's main page.
- **Search Through Bookmarks:** Search through all your bookmarks to find the manga you are looking for.

# Settings

- **Fetch MAL Image:** Uses the public `jikan` api to try and find the manga on `MyAnimeList` to get a better cover for it. Can be wrong, specially for smaller titles.

# Getting Started

## Usage

Either go to the [Website](https://akari-psi.vercel.app/) or host it yourself, see the Installation header.

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

## Prerequisites

Before running Akari, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

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

## Running the Development Server

To start the development server, run:

```bash
npm run dev
```

or

```bash
yarn dev
```

Open http://localhost:3000 in your browser to see the application.

## Production Build

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
