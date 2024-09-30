# MangaReader

MangaReader is a Next.js application designed to provide an enhanced manga reading experience. It uses [Manganato](https://manganato.com/) as a backend, leveraging its content while allowing users to manage and retain their bookmarks from the site directly within the application.

# Features

- **Seamless Manga Reading Experience:** Enjoy reading your favorite manga with a smooth interface.
- **Bookmark Integration:** All your bookmarks are synced and saved, allowing you to pick up where you left off, using the Manganato bookmark system.

# Getting Started

## Prerequisites

Before running MangaReader, make sure you have the following installed:

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

## Required Info

If you want to use your bookmarks from [Manganato](https://manganato.com/) you will need to get your `Username` and your `user_data`. The username is very easy to find, while the user_data is in your cookies.

Your username is simply the text in this box in the header.

![username](https://i.imgur.com/QUjTGdi.png)

To get your user_data:

1. Open Manganato Website: Visit Manganato and log in to your account.

2. Open Developer Tools: Right-click anywhere on the page and select Inspect or press F12 to open the developer tools. Navigate to the Application tab (or Storage in some browsers).

3. Locate the Cookie: Under Storage or Application, find Cookies in the left sidebar, and click on the https://manganato.com entry.

4. Find user_acc Cookie: Look for the user_acc cookie in the list. Copy its value.

5. Extract user_data: The user_acc cookie value is a JSON string. Paste it into a tool like JSON Formatter to view it properly. Extract the user_data field from this JSON object.
