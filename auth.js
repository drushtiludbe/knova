
/* KNOVA Authentication */

const firebaseConfig = {
  apiKey: "AIzaSyDUv4_ytwmr5ECGG1vA0TTKJs1P1QlzsoU",
  authDomain: "knova-e4dd8.firebaseapp.com",
  projectId: "knova-e4dd8",
  storageBucket: "knova-e4dd8.firebasestorage.app",
  messagingSenderId: "327143067880",
  appId: "1:327143067880:web:61ae906b2de88142b1795d",
  measurementId: "G-Q3NL205QLZ"
};

let auth = null;
let currentUser = null;
let authReady = false;

/* Messages */

function showMessage(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
    element.style.display = message ? "block" : "none";
  }
}

/* Errors */

function getFriendlyError(error) {
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/missing-password": "Please enter your password.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in window.",
    "auth/unauthorized-domain": "This website is not authorized to sign in.",
    "auth/network-request-failed": "Network error. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/account-exists-with-different-credential":
      "An account already exists with another sign-in method."
  };

  return messages[error?.code] || "Something went wrong. Please try again.";
}

/* Initialization */

document.addEventListener("DOMContentLoaded", function () {
  if (!window.firebase) {
    console.error("KNOVA setup error: Required scripts are missing.");
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
  } catch (error) {
    console.error("KNOVA setup error:", error);
    return;
  }

  /* Modal */

  const loginModal = document.getElementById("loginModal");

  function openLoginModal() {
    if (loginModal) {
      loginModal.hidden = false;
      loginModal.style.display = "flex";
    }
  }

  function closeLoginModal() {
    if (loginModal) {
      loginModal.hidden = true;
      loginModal.style.display = "none";
    }
  }

  document.querySelectorAll(".openLoginModal").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      openLoginModal();
    });
  });

  const closeButton = document.getElementById("closeLoginModal");

  if (closeButton) {
    closeButton.addEventListener("click", closeLoginModal);
  }

  if (loginModal) {
    loginModal.addEventListener("click", function (event) {
      if (event.target === loginModal) {
        closeLoginModal();
      }
    });
  }

  /* Google */

  document.querySelectorAll(
    "#googleSignIn, #googleSignUp, .googleSignIn"
  ).forEach(function (button) {
    button.addEventListener("click", async function (event) {
      event.preventDefault();

      showMessage("signupMessage", "");
      showMessage("loginMessage", "");

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);

        if (result.user) {
          window.location.href = "explore.html";
        }
      } catch (error) {
        const message = getFriendlyError(error);

        showMessage("signupMessage", message);
        showMessage("loginMessage", message);

        console.error("Sign-in error:", error);
      }
    });
  });

  /* Status */

  auth.onAuthStateChanged(function (user) {
    currentUser = user;
    authReady = true;

    const authButtons = document.getElementById("authButtons");
    const userArea = document.getElementById("userArea");
    const userName = document.getElementById("userName");

    if (authButtons) {
      authButtons.style.display = user ? "none" : "";
    }

    if (userArea) {
      userArea.style.display = user ? "flex" : "none";
    }

    if (userName && user) {
      userName.textContent = user.displayName || user.email || "User";
    }

    if (
      !user &&
      window.location.pathname.endsWith("/explore.html")
    ) {
      openLoginModal();
    }
  });

  /* Search */

  document.querySelectorAll(".search-container").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const input =
        form.querySelector('input[name="q"]') ||
        form.querySelector('input[type="search"]') ||
        form.querySelector('input[type="text"]');

      const query = input ? input.value.trim() : "";

      if (!query) {
        if (input) input.focus();
        return;
      }

      if (!authReady || !currentUser) {
        openLoginModal();
        return;
      }

      window.location.href =
        "results.html?q=" + encodeURIComponent(query);
    });
  });

  /* Navigation */

  document.querySelectorAll('a[href="explore.html"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (!authReady || !currentUser) {
        event.preventDefault();
        openLoginModal();
      }
    });
  });

  /* Signup */

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      showMessage("signupMessage", "");

      const nameInput =
        signupForm.querySelector('[name="name"]') ||
        signupForm.querySelector("#name");

      const emailInput =
        signupForm.querySelector('[name="email"]') ||
        signupForm.querySelector("#email");

      const passwordInput =
        signupForm.querySelector('[name="password"]') ||
        signupForm.querySelector("#password");

      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const password = passwordInput?.value;

      if (!name || !email || !password) {
        showMessage("signupMessage", "Please complete all fields.");
        return;
      }

      try {
        const result = await auth.createUserWithEmailAndPassword(
          email,
          password
        );

        await result.user.updateProfile({
          displayName: name
        });

        window.location.href = "index.html";
      } catch (error) {
        showMessage("signupMessage", getFriendlyError(error));
        console.error("Signup error:", error);
      }
    });
  }

  /* Login */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      showMessage("loginMessage", "");

      const emailInput =
        loginForm.querySelector('[name="email"]') ||
        loginForm.querySelector("#email");

      const passwordInput =
        loginForm.querySelector('[name="password"]') ||
        loginForm.querySelector("#password");

      const email = emailInput?.value.trim();
      const password = passwordInput?.value;

      if (!email || !password) {
        showMessage("loginMessage", "Please enter your email and password.");
        return;
      }

      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "index.html";
      } catch (error) {
        showMessage("loginMessage", getFriendlyError(error));
        console.error("Login error:", error);
      }
    });
  }
});

