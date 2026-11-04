# Database redesign review

This is a local, unpushed redesign of the existing Quartz 4.5.2 site. The content
submodule remains separate. The deployment workflow, deploy key configuration,
daily schedule and existing content paths are unchanged. Editorial files are
excluded from publication only as explicitly approved by the owner.

## Reader-facing changes

- Paper/ink/cinnabar palette with indigo accents; light and ink-dark themes.
- Noto Serif TC headings and quotations; Noto Sans TC body. The homepage's
  Google Fonts glyph subsets are served locally with their OFL notices.
- Structured cards for characters, artifacts, mounts, spells and formations.
  Wiki links resolve through the build's file list, with plain-text fallback.
  Seven game values appear under an explicit L3 disclosure.
- Managed illustration sections move below the entry text, preserving every
  caption, source and license. Responsive galleries and an accessible image
  dialog replace the sequence of full-width images.
- A build-time character JSON index drives faceted filtering, stroke sorting
  and a portrait wall. Mounts remain at their original URLs and have their own
  type filter in the artifact overview.
- Chapter pages derive first appearances/deaths and adjacent chapter links.
  Search indexes aliases and labels result types. Character graphs use one
  layer of structured relationships; a separate page hosts the full graph.
- The image index is a five-category thumbnail catalogue. The homepage has six
  approved portraits, the owner's final wording, navigation cards and counts.
- Image statistics remain in the update log. Editorial wording distinguishes
  unwritten material (待補) from unresolved research (待考).
- Source/rights pages, footer, descriptions and social images are explicit.
  Alias redirects also receive descriptions and social images.

Character, artifact, mount and chapter counts use frontmatter entity types,
excluding overview pages. The canonical god count comes from the god register's
declared total; image counts come from the source manifest. The displayed entity
counts are 384 characters, 139 artifacts, 16 mounts and 100 chapters.

## Validation

Run with Node 22 or newer and an initialized content submodule:

```sh
npx quartz build
npx tsc --noEmit --incremental false
python content/00-說明/scripts/audit_links.py
```

Additional review scripts live in `content/00-說明/scripts/`:

- `site_review.py`: source hashes and six-page desktop/mobile screenshots.
- `verify_redesign.py`: quote/source/image/slug integrity, emitted image paths,
  metadata, search, filters, chapter navigation, dialog and mobile interactions.
- `compare_screenshots.py`: before/after review sheet.
- `move_illustrations.py`, `redesign_home.py`, `normalize_pending.py`,
  `clean_editorial_language.py`: content migrations, dry-run by default.
- `cache_home_fonts.py`: refresh locally served homepage font subsets and OFL
  notices, dry-run by default. Rebuild before inspecting and refreshing its plan.

Browser scripts use Python Playwright/Chromium; font caching also uses requests
and BeautifulSoup; the review sheet uses Pillow. These are local review tools,
not additional deployment requirements.

Review artifacts are ignored under `private/`. Baseline: 12 captures; final:
24 captures covering 1440/390 pixels in both themes, plus the comparison sheet.
The validation checks 1,421 emitted HTML files and 1,211 local image references.
Original quotation lines, managed source blocks, image bytes and content paths
are unchanged. The link audit retains the pre-existing 64 missing-target types
and introduces none. Mobile checks have no document-level horizontal overflow.

Mobile Lighthouse homepage results on the same local machine: performance
96 → 100; accessibility 83 → 100. Timing scores can vary with the environment;
these are local measurements, not a production SLA. Full reports remain under
`private/reports/`.

The last parser correction makes wiki-link aliases inside Markdown tables work
with both LF and CRLF input. It changes parsing only, leaving source text intact.

## Publication

No push or deployment is authorized until the owner has reviewed the screenshots
and summary. When approved, push the content branch first, then the site branch;
the workflow deliberately fetches the content remote branch using its deploy key.
