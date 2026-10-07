# Haz Wedding Card — Hazwan & Ayu

A static digital wedding invitation. There's no framework and no build step, so you can open `index.html` directly in a browser.
It will be hosted at `benangkasih-hazwanayu.github.io`, with Google Apps Script + Google Sheet for RSVP and ucapan (not wired yet).

## Structure

```
index.html              markup for every section (one page)
assets/
  css/themes.css        colour tokens per theme  ← change the LOOK here
  css/base.css          layout, components, animation (reads tokens only)
  js/content.js         names, dates, venue, aturcara, contacts  ← change the WORDS here
  js/app.js             engine: theme, phase, intro, petals, countdown, RSVP/ucapan mocks
  audio/lagu.mp3        (add) background music, ~2–3 MB
  img/og-preview.jpg    (add) WhatsApp preview image, 1200×630, < 300 KB
```

## Preview switches (add to the URL)

| Switch | Effect |
|---|---|
| `?theme=melur` / `?theme=malam` | Try another theme |
| `?phase=day` / `?phase=post` | Show the wedding-day or after-event version |
| `?to=Pak%20Ali` | Personal "Kepada: Pak Ali" greeting |
| `?nointro` | Skip the songket intro (faster while designing) |

You can combine them, for example `index.html?theme=melur&phase=pre&to=Mak%20Long&nointro`.

## Current status

- Design and UI/UX: in progress
- RSVP: **mock** (1-second fake send). Replace `submitRsvp()` in `app.js` with the GAS `fetch`.
- Ucapan: **mock** (stays in the browser). It will load from and post to GAS.
- Calendar: works (Google Calendar link + .ics download).
- Anything in `[brackets]` in `content.js` is a placeholder.
