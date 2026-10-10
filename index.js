"use strict";

const USERS_STORAGE_KEY = "wayfarer-users";
const SESSION_STORAGE_KEY = "wayfarer-session";

function getField(form, name) {
  return form.elements.namedItem(name);
}

function showFieldError(input, message) {
  const errorElement = document.getElementById(`${input.id}-error`);
  input.classList.toggle("is-invalid", Boolean(message));
  input.classList.toggle("is-valid", !message && input.value.trim().length > 0);
  input.setAttribute("aria-invalid", String(Boolean(message)));
  if (errorElement) errorElement.textContent = message;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateSignupField(form, name) {
  const input = getField(form, name);
  const value = name === "password" || name === "confirmPassword" ? input.value : input.value.trim();
  let message = "";

  if (name === "fullName" && !value) {
    message = "Enter your full name.";
  } else if (name === "email" && !value) {
    message = "Enter your email address.";
  } else if (name === "email" && !validateEmail(value)) {
    message = "Enter a valid email address, such as you@example.com.";
  } else if (name === "phone" && !/^\d{10}$/.test(value)) {
    message = "Enter a 10-digit phone number.";
  } else if (name === "city" && !/^\p{L}+(?: \p{L}+)*$/u.test(value)) {
    message = "Use letters and spaces only.";
  } else if (name === "password" && value.length < 8) {
    message = "Use at least 8 characters.";
  } else if (name === "password" && (!/[A-Za-z]/.test(value) || !/\d/.test(value))) {
    message = "Include at least one letter and one number.";
  } else if (name === "confirmPassword" && !value) {
    message = "Confirm your password.";
  } else if (name === "confirmPassword" && value !== getField(form, "password").value) {
    message = "Passwords do not match.";
  }

  showFieldError(input, message);
  return !message;
}

function validateSigninField(form, name) {
  const input = getField(form, name);
  const value = input.value.trim();
  let message = "";

  if (name === "email" && !value) {
    message = "Enter your email address.";
  } else if (name === "email" && !validateEmail(value)) {
    message = "Enter a valid email address.";
  } else if (name === "password" && !input.value) {
    message = "Enter your password.";
  }

  showFieldError(input, message);
  return !message;
}

function setFormMessage(form, message, type) {
  const element = form.querySelector("[data-form-message]") || form.parentElement.querySelector("[data-form-message]");
  element.className = `alert form-alert alert-${type}`;
  element.textContent = message;
  element.hidden = false;
}

function clearFormMessage(form) {
  const element = form.querySelector("[data-form-message]") || form.parentElement.querySelector("[data-form-message]");
  if (element) {
    element.hidden = true;
    element.textContent = "";
  }
}

function readUsers() {
  const savedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!savedUsers) return [];

  const users = JSON.parse(savedUsers);
  if (!Array.isArray(users) || users.some((user) => !user || typeof user.email !== "string" || typeof user.password !== "string")) {
    throw new Error("Saved account data is not in the expected format.");
  }
  return users;
}

function setupSignup(form) {
  const fieldNames = ["fullName", "email", "phone", "city", "password", "confirmPassword"];
  fieldNames.forEach((name) => {
    const input = getField(form, name);
    input.addEventListener("input", () => {
      clearFormMessage(form);
      validateSignupField(form, name);
      if (name === "password" && getField(form, "confirmPassword").value) {
        validateSignupField(form, "confirmPassword");
      }
    });
    input.addEventListener("blur", () => validateSignupField(form, name));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = fieldNames.map((name) => validateSignupField(form, name)).every(Boolean);
    if (!valid) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    try {
      const users = readUsers();
      const email = getField(form, "email").value.trim().toLowerCase();
      const user = {
        fullName: getField(form, "fullName").value.trim(),
        email,
        phone: getField(form, "phone").value.trim(),
        city: getField(form, "city").value.trim(),
        password: getField(form, "password").value
      };
      const existingUser = users.find((savedUser) => savedUser.email.toLowerCase() === email);
      if (existingUser) {
        showFieldError(getField(form, "email"), "An account with this email already exists.");
        getField(form, "email").focus();
        return;
      }

      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, user]));
      setFormMessage(form, "Your account is ready. Sign in to continue.", "success");
      form.reset();
      fieldNames.forEach((name) => {
        const input = getField(form, name);
        input.classList.remove("is-valid", "is-invalid");
        input.removeAttribute("aria-invalid");
      });
      form.querySelectorAll("[data-toggle-password]").forEach((button) => {
        const input = document.getElementById(button.dataset.togglePassword);
        input.type = "password";
        button.textContent = "Show";
        button.setAttribute("aria-label", "Show password");
        button.setAttribute("aria-pressed", "false");
      });
    } catch (error) {
      setFormMessage(form, `We couldn't save your account: ${error.message}`, "danger");
    }
  });
}

function setupSignin(form) {
  const fieldNames = ["email", "password"];
  fieldNames.forEach((name) => {
    const input = getField(form, name);
    input.addEventListener("input", () => {
      clearFormMessage(form);
      validateSigninField(form, name);
    });
    input.addEventListener("blur", () => validateSigninField(form, name));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = fieldNames.map((name) => validateSigninField(form, name)).every(Boolean);
    if (!valid) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    try {
      const email = getField(form, "email").value.trim().toLowerCase();
      const password = getField(form, "password").value;
      const user = readUsers().find((registeredUser) => registeredUser.email.toLowerCase() === email);

      if (!user || user.password !== password) {
        setFormMessage(form, "We couldn't find an account with those details. Check your email and password, or create an account.", "danger");
        return;
      }

      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ email: user.email }));
      window.location.assign("travelapp.html");
    } catch (error) {
      setFormMessage(form, `We couldn't verify your account: ${error.message}`, "danger");
    }
  });
}

function setupPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.textContent = shouldShow ? "Hide" : "Show";
      button.setAttribute("aria-label", `${shouldShow ? "Hide" : "Show"} password`);
      button.setAttribute("aria-pressed", String(shouldShow));
    });
  });
}

function setupLandingPage() {
  const welcome = document.querySelector("[data-welcome-user]");
  const signoutButton = document.querySelector("[data-signout]");
  const sessionData = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      const user = readUsers().find((registeredUser) => registeredUser.email === session.email);
      if (!user) throw new Error("The signed-in account is no longer registered.");
      welcome.textContent = `Hi, ${user.fullName.split(/\s+/)[0]}`;
    } catch (error) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      setFormMessage(document.querySelector("main"), `Your sign-in session could not be restored: ${error.message}`, "danger");
    }
  }

  signoutButton.addEventListener("click", () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.assign("SignIn.html");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();
  const page = document.body.dataset.page;
  if (page === "signup") setupSignup(document.getElementById("signup-form"));
  if (page === "signin") setupSignin(document.getElementById("signin-form"));
  if (page === "landing") setupLandingPage();
});
