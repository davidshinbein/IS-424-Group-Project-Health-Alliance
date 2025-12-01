# IS-424-Group-Project-Health-Alliance

Public Repository for IS 424 term project for the Global Health Alliance Chapter at UW Madison

### Navbar visual fix

If you noticed a white box around a navbar item after clicking it, that was caused by header styles not being loaded on every page. `header.css` was added to every page's <head> so the header/navbar rules (including focus/active overrides) apply site-wide and prevent the white-on-white box from appearing.

### Accessible focus styles for the navbar

Keyboard users need a visible indication of which navigation link has focus. Previously the site hid focus rings on navbar items which made keyboard navigation inaccessible. I updated `public/styles/header.css` to use `:focus-visible` to show a subtle, high-contrast focus ring for keyboard users while keeping the appearance unchanged for mouse users.

If you'd like the focus appearance tweaked (color, thickness, or animation) I can adjust it — but this ensures users who navigate with Tab still have a visible cue.
