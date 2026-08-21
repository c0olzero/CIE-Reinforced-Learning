# Putting this online with GitHub Pages

## 1. Get the files into your repo folder

Unzip the download. Inside is a folder `wb`. Copy **everything inside `wb`** into
your repository folder — not the `wb` folder itself.

Your repo should end up looking like this, with `index.html` at the top level:

    your-repo/
      index.html
      engine/
      games/
      styles/
      subjects/
      sw.js
      .nojekyll
      README.md

If you end up with `your-repo/wb/index.html`, Pages will not find the site.

Keep your existing `workbench.html` for now. It still works on its own and is a
fallback until the new version is confirmed.

## 2. Check it locally first

In Claude Code, ask: *"start a local server in this folder"*, then open the
address it prints (usually http://localhost:8000).

Opening `index.html` by double-clicking will **not** work — browsers block the
module loading this app uses on `file://` paths. This is expected.

## 3. Commit and push

In Claude Code: *"add all the new files, commit them with a message about
splitting the app into modules, and push to main"*.

## 4. Turn on GitHub Pages

On github.com, in your repository: **Settings → Pages → Source: Deploy from a
branch → Branch: main → folder: / (root) → Save**.

Wait about a minute. The URL appears at the top of that same page and looks like
`https://YOURNAME.github.io/YOUR-REPO/`.

## 5. Check it worked

Open the URL. You should see the hub with the module cards. Click into one — the
tabs appear after a moment because that module is fetched on demand.

If you see a blank page, press F12, open the Console tab, and send me what it
says. Almost always it is a path or capitalisation problem.

## 6. Install it on her tablet

Open the URL in the tablet's browser, then "Add to Home Screen". It gets an icon
and opens full screen with no browser bars, and works offline afterwards.

## Later, when you change something

Push as usual. Because the service worker is network-first, a normal refresh
picks up the new version. If a page ever looks stale, a hard refresh
(Ctrl+Shift+R, or Cmd+Shift+R on Mac) clears it.
