document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".chat-input input");
  const sendBtn = document.querySelector(".send");
  const body = document.querySelector(".chat-body");

  function getTime() {
    const d = new Date();
    return d.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const msg = document.createElement("div");
    msg.classList.add("msg", "right");
    msg.innerHTML = `${text}<div class="time">${getTime()}</div>`;

    body.appendChild(msg);
    scrollToBottom();
    input.value = "";

    botReply(text);
  }

  /* ——— Автоматический ответ ——— */
  function botReply(userText) {
    const responses = [
      "Интересно!",
      "Расскажи подробнее.",
      "Понимаю.",
      "Согласна 💜",
      "А что было дальше?",
      "Хорошо!"
    ];

    const answer = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      const msg = document.createElement("div");
      msg.classList.add("msg", "left");
      msg.innerHTML = `${answer}<div class="time">${getTime()}</div>`;
      body.appendChild(msg);
      scrollToBottom();
    }, 600);
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  scrollToBottom();
});
