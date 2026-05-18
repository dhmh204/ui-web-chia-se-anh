
const current = location.pathname.split("/").pop() || "photographer-dashboard.html";

document.querySelectorAll("[data-nav]").forEach((item) => {
  if (item.getAttribute("href") === current) {
    item.classList.add("active");
  }
});

document.querySelectorAll("[data-mobile-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".sidebar")?.classList.toggle("open");
  });
});

document.querySelectorAll("[data-demo-alert]").forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("Đây là giao diện demo. Chức năng backend sẽ xử lý sau.");
  });
});

document.querySelectorAll("[data-like]").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    btn.textContent = btn.classList.contains("active") ? "♥" : "♡";
  });
});
