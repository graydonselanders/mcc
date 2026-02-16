# McMaster Climbing Club Static Site

## Newsletter publishing (for future execs)

### How to add a newsletter
1. Export the monthly newsletter from Google Docs as **Markdown (.md)**.
2. Make sure the file starts with front matter:

```md
---
title: "Month YYYY Newsletter"
date: "YYYY-MM-01"
---
```

3. Save it as `YYYY-MM.md` inside `/newsletters/` (example: `2026-03.md`).
4. Add the filename to `/newsletters/index.json` (one new line entry).
5. Deploy.

### Images in newsletters
- Put image files in `/assets/newsletters/`.
- Reference images in Markdown like:
  - `![Alt text](/assets/newsletters/myphoto.png)`

If Google Docs export creates odd image paths, update those paths manually to the format above.

### Local preview (important)
`fetch()` for newsletters will not work from `file://` URLs. Run a local server first:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
