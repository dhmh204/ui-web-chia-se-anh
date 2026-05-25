
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

const tabs = document.querySelectorAll('.tab');
const photoGallery = document.querySelector('.photo-gallery');
const faceGallery = document.querySelector('.face-gallery');

function switchGallery(tabKey) {
  if (tabKey === 'faces') {
    photoGallery.classList.add('hidden');
    faceGallery.classList.remove('hidden');
  } else {
    faceGallery.classList.add('hidden');
    photoGallery.classList.remove('hidden');
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    switchGallery(tab.dataset.tab);
  });
});
