# Modular & Secure API Engine Dashboard

This project features a refactored application following a clean **MVC (Model-View-Controller)** structure. The refactor successfully resolves previous Jinja2 rendering issues and implements security best practices to protect sensitive developer credentials.

---

## 📂 Project Folder Structure

The application is organized as follows to ensure separation of concerns and maintainability:

```text
ConstruccionEnAplicacionesDeDatos/
│
├── api.py                    # Flask Python controller and API endpoints
│
├── templates/
│   └── index.html            # Dashboard structure, linking static assets
│
└── static/
    ├── css/
    │   └── styles.css        # Custom CSS rules (scrollbars, transitions)
    └── js/
        └── app.js            # Core interactive logic (SVG graph, OAuth login, tabs, counters)
