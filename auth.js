


/* Firebase Configuration */
const firebaseConfig = {
  apiKey: "YOUR_EXISTING_API_KEY",
  authDomain: "knova-e4dd8.firebaseapp.com",
  projectId: "knova-e4dd8",
  storageBucket: "YOUR_EXISTING_STORAGE_BUCKET",
  messagingSenderId: "YOUR_EXISTING_MESSAGING_SENDER_ID",
  appId: "YOUR_EXISTING_APP_ID",
  measurementId: "YOUR_EXISTING_MEASUREMENT_ID"
};

/* Initialize Firebase */
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

let currentUser = null;
let authReady = false;

window.auth = auth;

/* Elements */
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupMessage = document.getElementById("signupMessage");
const loginMessage = document.getElementById("loginMessage");

const authButtons = document.getElementById("authButtons");
const userArea = document.getElementById("userArea");
const userName = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");

const loginModal = document.getElementById("loginModal");
const closeLoginModal = document.getElementById("closeLoginModal");

/* Messages */
function showMessage(element, message, success = false) {
  if (!element) return;

  element.textContent = message;
  element.style.color = success ? "#2e9d69" : "#d9534f";
}

/* Password Requirements */
function checkPassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

function isPasswordValid(password) {
  return Object.values(checkPassword(password)).every(Boolean);
}

/* Live Password Checklist */
if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    if (!signupForm) return;

    const requirements = checkPassword(passwordInput.value);

    const labels = {
      length: "At least 8 characters",
      uppercase: "One uppercase letter (A-Z)",
      lowercase: "One lowercase letter (a-z)",
      number: "One number (0-9)",
      special: "One special character (!@#$...)"
    };

    Object.entries(labels).forEach(([id, label]) => {
      const item = document.getElementById(id);

      if (!item) return;

      const valid = requirements[id];

      item.classList.toggle("valid", valid);
      item.textContent = `${valid ? "✓" : "✗"} ${label}`;
    });
  });
}

/* Sign Up */
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!name) {
      showMessage(signupMessage, "Please enter your name.");
      return;
    }

    if (!isPasswordValid(password)) {
      showMessage(
        signupMessage,
        "Please meet all password requirements."
      );
      return;
    }

    try {
      showMessage(signupMessage, "Creating your account...", true);

      const credential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );

      await credential.user.updateProfile({
        displayName: name
      });

      showMessage(
        signupMessage,
        "Account created successfully!",
        true
      );

      window.location.href = "explore.html";
    } catch (error) {
      const messages = {
        "auth/email-already-in-use":
          "This email is already registered.",
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/weak-password":
          "Please choose a stronger password.",
        "auth/network-request-failed":
          "Network error. Please try again.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later."
      };

      showMessage(
        signupMessage,
        messages[error.code] ||
          "Unable to create your account. Please try again."
      );
    }
  });
}

/* Login */
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";

    if (!email || !password) {
      showMessage(
        loginMessage,
        "Please enter your email and password."
      );
      return;
    }

    try {
      showMessage(loginMessage, "Logging in...", true);

      await auth.signInWithEmailAndPassword(email, password);

      showMessage(loginMessage, "Login successful!", true);

      window.location.href = "explore.html";
    } catch (error) {
      const messages = {
        "auth/invalid-email":
          "Please enter a valid email address.",
        "auth/user-not-found":
          "No account found with this email.",
        "auth/wrong-password":
          "Incorrect email or password.",
        "auth/invalid-credential":
          "Incorrect email or password.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please try again."
      };

      showMessage(
        loginMessage,
        messages[error.code] || "Login failed. Please try again."
      );
    }
  });
}

/* Google Sign In */
const googleButtons = document.querySelectorAll(
  "#googleLogin, #googleSignIn, #googleSignUp, .googleSignIn"
);

googleButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      await auth.signInWithPopup(provider);

      window.location.href = "explore.html";
    } catch (error) {
      const messageElement = signupForm
        ? signupMessage
        : loginMessage;

      const messages = {
        "auth/popup-closed-by-user":
          "Sign-in was cancelled.",
        "auth/popup-blocked":
          "Please allow popups and try again.",
        "auth/unauthorized-domain":
          "This website is not authorized for sign-in.",
        "auth/network-request-failed":
          "Network error. Please try again."
      };

      showMessage(
        messageElement,
        messages[error.code] ||
          "Google sign-in failed. Please try again."
      );
    }
  });
});

/* Authentication State and Explore Protection */
auth.onAuthStateChanged((user) => {
  currentUser = user;
  authReady = true;

  window.currentUser = user;
  window.authReady = true;

  if (authButtons) {
    authButtons.hidden = !!user;
  }

  if (userArea) {
    userArea.hidden = !user;
  }

  if (userName) {
    userName.textContent = user
      ? `Hello, ${user.displayName || user.email.split("@")[0]}`
      : "";
  }

  const currentPage = window.location.pathname
    .split("/")
    .pop();

  if (currentPage === "explore.html" && !user) {
    alert("Please log in or sign up to access KNOVA Explore.");
    window.location.replace("login.html");
  }
});

/* Logout */
if (logoutButton) {
  logoutButton.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      await auth.signOut();
      window.location.href = "login.html";
    } catch (error) {
      alert("Unable to log out. Please try again.");
    }
  });
}

/* Login Modal */
if (closeLoginModal && loginModal) {
  closeLoginModal.addEventListener("click", () => {
    loginModal.hidden = true;
  });
}

/* Show / Hide Password */
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    const input = document.getElementById(button.dataset.target);

    if (!input) return;

    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";
    button.textContent = showPassword ? "Hide" : "Show";

    button.setAttribute(
      "aria-label",
      showPassword ? "Hide password" : "Show password"
    );
  });
});
