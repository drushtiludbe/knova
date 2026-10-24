
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


/* 
   SHARED HELPERS
    */

function showMessage(id, message) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = message;
    element.style.display = message ? "block" : "none";
  }
}

function getFriendlyError(error) {
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use":
      "An account already exists with this email.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/missing-password": "Please enter your password.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in window.",
    "auth/unauthorized-domain":
      "This website is not authorized to sign in.",
    "auth/network-request-failed":
      "Network error. Please try again.",
    "auth/too-many-requests":
      "Too many attempts. Please try again later.",
    "auth/account-exists-with-different-credential":
      "An account already exists with another sign-in method."
  };

  return messages[error?.code] ||
    "Something went wrong. Please try again.";
}


/* 
   INITIALIZATION
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase

  if (!window.firebase) {
    console.error("KNOVA: Firebase scripts are missing.");
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
  } catch (error) {
    console.error("KNOVA Firebase setup error:", error);
    return;
  }


  /* 
     LOGIN REQUIRED MODAL
  */

  const loginModal = document.getElementById("loginModal");
  const closeButton = document.getElementById("closeLoginModal");

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
      if (!currentUser) {
        event.preventDefault();
        openLoginModal();
      }
    });
  });

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


  /* 
     AUTHENTICATION STATUS + NAVBAR
   */

  auth.onAuthStateChanged(function (user) {
    currentUser = user;
    authReady = true;

    const authButtons = document.getElementById("authButtons");
    const userArea = document.getElementById("userArea");
    const userName = document.getElementById("userName");

    // Show Login/Sign Up only when logged out

    if (authButtons) {
      authButtons.hidden = !!user;
    }

    // Show greeting and Log Out only when logged in

    if (userArea) {
      userArea.hidden = !user;
    }

    if (userName) {
      userName.textContent = user
        ? "Hello, " + (user.displayName || user.email || "User")
        : "";
    }
  });


  /* 
     LOG OUT
   */

  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
      try {
        await auth.signOut();
        window.location.href = "index.html";
      } catch (error) {
        console.error("KNOVA logout error:", error);
        alert("Unable to log out. Please try again.");
      }
    });
  }


  /* 
     GOOGLE SIGN-IN
  */

  document.querySelectorAll(
    "#googleLogin, #googleSignIn, #googleSignUp, .googleSignIn"
  ).forEach(function (button) {
    button.addEventListener("click", async function (event) {
      event.preventDefault();

      showMessage("signupMessage", "");
      showMessage("loginMessage", "");

      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);

        window.location.href = "index.html";
      } catch (error) {
        const message = getFriendlyError(error);

        showMessage("signupMessage", message);
        showMessage("loginMessage", message);

        console.error("KNOVA Google sign-in error:", error);
      }
    });
  });


  /*
     SIGN UP
   */

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      showMessage("signupMessage", "");

      const name = signupForm.querySelector("#name")?.value.trim();
      const email = signupForm.querySelector("#email")?.value.trim();
      const password = signupForm.querySelector("#password")?.value;

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
        console.error("KNOVA signup error:", error);
      }
    });
  }


  /* 
     LOG IN
   */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      showMessage("loginMessage", "");

      const email = loginForm.querySelector("#email")?.value.trim();
      const password = loginForm.querySelector("#password")?.value;

      if (!email || !password) {
        showMessage(
          "loginMessage",
          "Please enter your email and password."
        );
        return;
      }

      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "index.html";
      } catch (error) {
        showMessage("loginMessage", getFriendlyError(error));
        console.error("KNOVA login error:", error);
      }
    });
  }


  /* 
     SEARCH PROTECTION
  */

  document.querySelectorAll(".search-container").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const input =
        form.querySelector('input[name="q"]') ||
        form.querySelector('input[type="search"]') ||
        form.querySelector('input[type="text"]');

      const query = input?.value.trim();

      if (!query) {
        input?.focus();
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


  /* 
     EXPLORE PROTECTION
   */

  document.querySelectorAll('a[href="explore.html"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (!authReady || !currentUser) {
        event.preventDefault();
        openLoginModal();
      }
    });
  });

});
