# IS-424-Group-Project-Health-Alliance

Public Repository for IS 424 term project for the Global Health Alliance Chapter at UW Madison

### Navbar visual fix

If you noticed a white box around a navbar item after clicking it, that was caused by header styles not being loaded on every page. `header.css` was added to every page's <head> so the header/navbar rules (including focus/active overrides) apply site-wide and prevent the white-on-white box from appearing.
