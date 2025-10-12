document.getElementById("authForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const login = document.getElementById("login");
  const password = document.getElementById("password");
  const loginError = document.getElementById("loginError");
  const passwordError = document.getElementById("passwordError");
  const globalMessage = document.getElementById("globalMessage");

  let hasError = false;
  loginError.textContent = "";
  passwordError.textContent = "";
  globalMessage.textContent = "";
  loginError.classList.remove("error-visible");
  passwordError.classList.remove("error-visible");

  if (login.value.trim() === "") {
    loginError.textContent = "Please enter your login or email.";
    loginError.classList.add("error-visible");
    hasError = true;
  }
  if (password.value.trim() === "") {
    passwordError.textContent = "Please enter your password.";
    passwordError.classList.add("error-visible");
    hasError = true;
  }

  if (!hasError) {
    if (login.value === "user" && password.value === "1234") {
      globalMessage.textContent = "Login successful!";
      globalMessage.className = "global-message success";
    } else {
      globalMessage.textContent = "Invalid login or password.";
      globalMessage.className = "global-message error";
    }
  }
});
