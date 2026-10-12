# HealthYou

**Live site:** https://healthyou-front-end.vercel.app/

HealthYou is a front-end web app that helps people keep up small daily health habits. You can set reminders for water, medication, movement and rest. The app also shows a fresh health tip every few seconds and includes a BMI calculator with a visual scale.

This is a **front-end demo**: accounts, reminders and settings are stored only in the visitor's own browser (localStorage), and nothing is sent to a server. A full-stack version with a Python/Flask back-end and database is in a separate repository: [healthyou_](https://github.com/Chiefopoku/healthyou_).

## Features

- **Dashboard**
  - A greeting by name and time of day.
  - A "tip of the moment" card with a Next tip button.
  - Summary counts of active and completed reminders.
- **Reminders**
  - 16 types, from hydration and medication to blood pressure checks and eye rest.
  - Repeat every 2, 4, 6, 8 or 10 hours.
  - Shown as browser notifications while the page is open.
  - Mark as done or delete. Reminders persist across visits.
- **BMI calculator**
  - Shows your BMI with a colour-coded scale and a marker. The standard boundaries are 18.5, 25 and 30.
  - Notes that BMI is a screening measure, not a diagnosis.
- **Accounts (demo)**
  - Sign up, log in and log out.
  - Passwords are hashed with SHA-256 before being stored, never kept as plain text.
- **Account settings**
  - Edit your profile.
  - Notification preferences with toggle switches.
  - Export your data as JSON, or delete everything stored on the device.
- **About page:** the project story, a developer profile card, an FAQ and a contact form that opens your email app.
- **Design**
  - Responsive layout, with dark mode that follows the system setting.
  - Sections fade in as you scroll, and the motion is switched off for people who choose "reduce motion".
  - Keyboard-friendly with labelled controls.

## Tech stack

- HTML5, CSS3 (custom design system with CSS variables) and vanilla JavaScript
- Browser APIs: localStorage, Web Crypto (password hashing) and Notifications
- Inline SVG icons and the Inter font
- Hosted on Vercel as a static site, with no build step

## Project structure

```
index.html       landing page
features.html    dashboard: tips, reminders, BMI calculator
about.html       story, developer, FAQ, contact
account.html     profile, notifications, data export and delete
login.html       log in
signup.html      sign up
styles/style.css design system and all page styles
scripts/script.js all app logic (shared by every page)
Assets/images/   images (developer photo)
```

## Run locally

No build tools are needed.

```bash
git clone https://github.com/Chiefopoku/healthyou-front-end.git
cd healthyou-front-end
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also open `index.html` directly in a browser.

## Updating

- **Text:** edit the HTML files.
- **Styles or scripts:** after changing `styles/style.css` or `scripts/script.js`, raise the `?v=` number where each page links them, so browsers fetch the new version.

## Notes and limitations

- **Reminders:** these only fire while a HealthYou tab is open. Background notifications would need a service worker and a push server.
- **Data stays in one browser:** clearing site data, or switching browser or device, starts fresh.
- **Not medical advice:** health tips are general wellness information.
- **Use cases:** the examples on the home page are illustrative, not real reviews.

## Author

Designed and built by [Emmanuel Opoku-Adjei](https://chiefopoku.github.io/portfolio/). The project began as a portfolio project at Holberton School.
