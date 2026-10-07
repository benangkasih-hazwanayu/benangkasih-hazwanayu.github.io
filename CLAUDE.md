# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static, single-page digital wedding invitation (Malay, `lang="ms"`) for Hazwan & Ayu. Plain HTML/CSS/vanilla JS (ES5-style IIFE): no framework, no build, no package manager, no tests, no linter. Hosted on GitHub Pages (`benangkasih-hazwanayu.github.io`, see Deploy). RSVP and ucapan (guest wishes) will go to Google Apps Script + Google Sheet but are still mocks.

## Running

Open `index.html` directly in a browser, or serve the folder (for example `python -m http.server`). Use URL switches to preview states without changing the date or config:

- `?theme=marun|awan|melur|malam` sets the theme
- `?phase=pre|day|post` forces the event phase
- `?to=Pak%20Ali` adds the personal "Kepada …" greeting
- `?nointro` skips the songket loom intro

These can be combined.

## Architecture

The code splits into content, look, and engine. Keep that split when you edit:

- **`assets/js/content.js`** defines `window.CONTENT`, which holds all wording, dates, venue, schedule, contacts, music path and feature flags. Values in `[brackets]` are placeholders.
- **`assets/css/themes.css`** holds colour tokens only, one `[data-theme="…"]` block per theme. **`base.css` must never contain hex colours.** It reads only the CSS variables. To add a theme, add a new block that defines the full token set.
- **`assets/js/app.js`** is the engine. It reads `CONTENT` and wires everything up in numbered sections: theme, content binding, guest greeting, phase, intro/cover, petals, countdown, scroll, calendar, RSVP, ucapan.

How the HTML is driven:
- `data-bind="couple.a"` sets the element's textContent from that dotted path into `CONTENT`. `data-href="venue.waze"` sets `href` the same way.
- Repeated lists (`#schedule`, `#contacts`, `#wishes`) are cloned from `<template>` elements (`#tplSchedule`, `#tplContact`, `#tplWish`).
- `data-phase="pre"` (or `"day post"`) shows an element only in those phases. The phase comes from `CONTENT.event.start`/`end` (ISO with `+08:00`): `pre` runs until midnight of the event day, `day` lasts until 2h after `end`, and `post` comes after that. `<html>` also gets `data-phase` and `data-theme` attributes for CSS hooks.
- `data-guest` / `data-guest-line` are filled or unhidden from `?to=`.
- `.reveal` elements fade in through an IntersectionObserver. Respect `prefers-reduced-motion`: the existing code disables the intro, petals and reveals.

Flow: intro (loom built in JS, about 5.4s) → `#cover` → tap `#openBtn`, which unlocks scrolling, starts music (the tap is the user gesture browsers require for autoplay) and starts petals.

## Pending integration points

- `submitRsvp()` in `app.js` is a 1-second mock. Replace it with the GAS `fetch`. The `TODO(GAS)` comment shows the intended shape: POST with `Content-Type: text/plain` to avoid the CORS preflight.
- Ucapan is kept in memory only. It needs to load from and post to GAS.
- `assets/audio/lagu.mp3` and `assets/img/og-preview.jpg` (1200×630, under 300 KB) don't exist yet. If the audio file is missing, the music toggle stays silent.

## Deploy

GitHub Pages serves the site from `main`, which tracks `origin/main`. Deploy through git CLI only. **Never use browser automation** (Chrome or the built-in browser) to deploy, upload files or change GitHub settings.

Steps (committing and pushing each need the user's approval; one request such as "commit and push" approves both):
1. Bump `?v=N` in `index.html` for each CSS/JS file you changed (see Cache busting).
2. Check the remote and identity: `git remote -v` must show only `origin` = `github.com/benangkasih-hazwanayu/benangkasih-hazwanayu.github.io`, and `git config user.email` must be the personal Gmail. Stop if either looks different. Never add another remote, and don't change this repo's local `user.name` / `user.email`.
3. Stage specific files (not `git add -A`) and commit on `main`.
4. `git push origin main`. The site is live about a minute later. Never force-push: `origin/main` holds the deploy history.

Troubleshooting:
- **Push hangs:** Git Credential Manager is waiting on a GitHub sign-in window. Stop and have the user run `! git push origin main` and sign in as `benangkasih-hazwanayu`. The login is saved after that.
- **Push rejected (non-fast-forward):** someone pushed from elsewhere. Run `git pull --rebase origin main`, then push again. Don't force-push.
- **`index.lock` / `HEAD.lock` "File exists":** a crashed git command left a lock. Check that no git process is running and the lock is old, then ask the user before deleting it.

## Cache busting

`index.html` loads assets with `?v=N` query strings. Bump the version on any CSS/JS file you change so the hosted page and WhatsApp/browser caches pick it up.
