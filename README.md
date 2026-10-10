# Wayfarer Signup and Signin

A responsive, client-side signup and signin project for the Module 2 assignment. It uses semantic HTML, Bootstrap's responsive grid and form classes, custom CSS, and JavaScript validation.

## Run locally

Open `SignUp.html` in a modern browser. Create an account, then follow the sign-in link and use the same email and password. A successful sign-in opens `travelapp.html`; the landing-page sign-out button returns to the sign-in page.

## Validation included

- Required signup fields: full name, email, 10-digit phone number, city, password, and matching confirmation.
- Email format, alphabetic city names (with spaces or hyphens), and passwords of at least eight characters containing letters and numbers.
- Required sign-in fields and email format, followed by a match against an account created in this browser.
- Inline feedback while typing, accessible field descriptions, and show/hide password controls.
- Responsive layouts for mobile, tablet, and desktop.

## Publish with GitHub Pages

Create a GitHub repository, add these project files, and push them to its default branch. In the repository settings, open **Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, and save. GitHub Pages will provide the published URL after deployment. Since the page files live at the repository root, use the repository's GitHub Pages URL followed by `/SignUp.html` to open signup.

## Demo authentication notice

This assignment stores accounts and the current session in the browser's `localStorage`. Passwords are stored as plain text, and browser storage can be edited or cleared by the user. This is suitable only for a front-end demonstration; a real application must use a secure server-side account system, password hashing, and proper session management.
