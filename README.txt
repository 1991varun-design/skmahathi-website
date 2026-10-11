SK MAHATHI WEBSITE — PHASE 1C
SINGLE STYLESHEET / CONSISTENT SHELL / CLEAN BASELINE FOR THE REDESIGN
======================================================================

WHAT CHANGED IN THIS PHASE
--------------------------
1. ONE STYLESHEET. css/style.css is now the only CSS file. mobile.css, home.css,
   about.css and concerts.css were merged into it (in the same cascade order, so
   Home, About and Concerts render pixel-for-pixel as before on desktop and
   mobile). Rules that were provably dead (overridden by later rules, or for
   markup that no longer exists) were removed.
2. ONE SHARED SHELL. The header, navigation and footer styling used to be
   copy-pasted three times (Home / About / Concerts) while Music, Contact and
   Enroll still used an older plain look. It now lives once in style.css and
   every page uses it.
3. THEME TOKENS. The ivory / antique-gold / deep-maroon colours are defined once
   in :root (--ivory, --maroon-deep, --maroon-dark, --gold-antique, --gold-light,
   --brown, --muted-warm). Change the theme there.
4. NAVIGATION. The active page is highlighted correctly on every page
   (aria-current="page" is set too). "Enroll" was wrongly marked active on Home,
   Music and Contact. All pages now have the same aria-labels on the logo link
   and the menu.
5. CONCERT SORTING lives only in js/main.js (the duplicate inline script was
   removed from concerts.html, which now loads main.js).
6. IMAGES. banner.jpg: 4032x3024 / 2.2 MB -> 1920x1440 / ~630 KB.
   New assets/images/og-image.jpg (1200x630) for link previews.
7. METADATA. The placeholder og:url (https://example.com) was removed. og:image
   now points at og-image.jpg instead of an SVG (social sites don't accept SVG).
   About, Concerts and Enroll gained the same sharing tags as the other pages.
8. HOME: the empty hero caption <p> was removed; its spacing was folded into the
   hero padding so the name and buttons sit exactly where they did.

SITE ADDRESS
------------
Open Graph tags (link previews) use https://www.skmahathi.com. The reserved
"Enroll future tab" page has no og:url on purpose.

FILES
-----
index.html  about.html  music.html  concerts.html  contact.html  enroll.html
Enroll future tab.html   (reserved; not in the active navigation)
css/style.css            (everything)
js/main.js               (smooth scroll, concert sorting, forms)
assets/images/           banner.jpg, og-image.jpg, profile.jpg, logo.png/.svg, favicon.ico

CSS MAP (css/style.css)
-----------------------
1. Design tokens        4. Shared components (buttons, cards, tables, forms ...)
2. Reset / base         5. Responsive rules shared by all pages
3. Shared shell         6. Page sections: Home (6a), About (6b), Concerts (6c),
   (header, nav, footer)   each scoped to <body class="page-...">

FIXED AFTER PHASE 1C
--------------------
- Phone menu overflow: the menu now scales to fit (tested 320-1280px, no page
  scrolls sideways). The Contact form also no longer overflows at 320px.
- logo.png now has a transparent background (no box behind it on the header).

ADDING A CONCERT
----------------
Copy one <tr> in concerts.html. The list is newest date first; date format is
dd-mm-yyyy (the sorter depends on it).

TEST BEFORE PUBLISHING
----------------------
- Every page on desktop + phone (header, footer, active menu item)
- Concert table sorting on desktop; card layout on mobile
- Contact / concert enquiry validation + submission
- Enroll notification submission
- Footer / social links
