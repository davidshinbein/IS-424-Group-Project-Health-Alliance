# IS-424-Group-Project-Health-Alliance
Public Repository for IS 424 term project for the Global Health Alliance Chapter at UW Madison

## Contact form — front-end only (static)

The site includes a contact form on `public/get-involved.html`. This repository is now configured so the form is front-end only and does not submit to any server.

When a visitor submits the form, the browser will produce and download a JSON file containing the submitted data (name, email, message, and timestamp). This keeps the repository static and avoids requiring a backend or cloud config.

Preview locally using a static server (recommended):

```powershell
# from project root, serve the public folder
# using Python
cd public; python -m http.server 8000

# or using node's http-server
npx http-server ./public -p 8000
```

Open `http://localhost:8000/get-involved.html` and submit the form — a file named `contact-message.json` should be downloaded by the browser.
