/**
 * Noofoto Admin Demo - Quản lý ảnh & Luồng Upload (Cloudinary + AI Processing)
 * Tương tác thời gian thực thông qua LocalStorage và liên kết Album / Dự án
 */

const STORAGE_KEY = "noofoto_photos";

// Dự án và Album Mappings
const projectAlbumMap = {
  project_1: {
    name: "Kỷ yếu 12A1",
    albums: [{ id: "album_1", name: "Ảnh gốc (Kỷ yếu 12A1)" }]
  },
  project_2: {
    name: "Cưới Hoàng & Linh",
    albums: [{ id: "album_2", name: "Hậu kỳ (Cưới Hoàng & Linh)" }]
  },
  project_3: {
    name: "Concept nàng thơ",
    albums: [{ id: "album_3", name: "Final (Concept nàng thơ)" }]
  }
};

// Dữ liệu mẫu ban đầu để hiển thị đồng bộ với giao diện
const seedPhotos = [
  {
    ma_anh: "photo_1",
    album_id: "album_1", // Ảnh gốc - Kỷ yếu 12A1
    ten_anh: "IMG_6773.PNG",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60",
    url_cloudinary: "https://res.cloudinary.com/noofoto/image/upload/v17794828/IMG_6773.png",
    trang_thai: "HIEN_THI", // HIEN_THI, DANG_SUA, AN, MO
    luot_thich: 12,
    ai_meta: {
      do_mo: 12, // 12% blur - đạt chuẩn sắc nét
      nhan: ["Cô dâu", "Chú rể", "Ngoài trời", "Cưới hỏi"],
      so_khuon_mat: 2,
      khuon_mat_boxes: [
        { top: 20, left: 32, width: 14, height: 18, label: "Bride (98%)" },
        { top: 22, left: 50, width: 13, height: 17, label: "Groom (96%)" }
      ]
    },
    phan_hoi: [
      {
        khach_hang: "Nguyễn Hoàng Minh",
        noi_dung: "Ảnh này đẹp quá, lấy làm ảnh chính album nhé anh!",
        thoi_gian: "24/05/2026 09:15",
        phan_hoi_admin: "Ok em, anh đã lưu lại làm ảnh chính rồi nhé."
      },
      {
        khach_hang: "Nguyễn Hoàng Minh",
        noi_dung: "Góc chụp này ánh sáng hoàn hảo lắm.",
        thoi_gian: "24/05/2026 09:18",
        phan_hoi_admin: ""
      }
    ]
  },
  {
    ma_anh: "photo_2",
    album_id: "album_2", // Hậu kỳ - Cưới Hoàng & Linh
    ten_anh: "IMG_6810.PNG",
    url: "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=800&auto=format&fit=crop&q=60",
    url_cloudinary: "https://res.cloudinary.com/noofoto/image/upload/v17794828/IMG_6810.png",
    trang_thai: "DANG_SUA",
    luot_thich: 8,
    ai_meta: {
      do_mo: 18, // 18% blur
      nhan: ["Cô dâu", "Cận cảnh", "Bó hoa cưới"],
      so_khuon_mat: 1,
      khuon_mat_boxes: [
        { top: 15, left: 42, width: 16, height: 20, label: "Bride (95%)" }
      ]
    },
    phan_hoi: [
      {
        khach_hang: "Nguyễn Hoàng Minh",
        noi_dung: "Nhờ thợ sửa màu da cô dâu hồng hào hơn tí.",
        thoi_gian: "24/05/2026 10:02",
        phan_hoi_admin: "Đã nhận yêu cầu, đang xử lý hậu kỳ lại."
      }
    ]
  },
  {
    ma_anh: "photo_3",
    album_id: "album_3", // Final - Concept nàng thơ
    ten_anh: "IMG_6902.PNG",
    url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=60",
    url_cloudinary: "https://res.cloudinary.com/noofoto/image/upload/v17794828/IMG_6902.png",
    trang_thai: "MO",
    luot_thich: 0,
    ai_meta: {
      do_mo: 82, // 82% blur -> AI tự động ẩn hoặc cảnh báo mờ
      nhan: ["Ngoại cảnh", "Chú rể", "Chuyển động"],
      so_khuon_mat: 1,
      khuon_mat_boxes: [
        { top: 28, left: 38, width: 15, height: 19, label: "Groom (Blur Alert)" }
      ]
    },
    phan_hoi: []
  }
];

// Khởi tạo Database hình ảnh
function getPhotosFromDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPhotos));
    return seedPhotos;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Lỗi parse data hình ảnh từ LocalStorage:", e);
    return seedPhotos;
  }
}

function savePhotosToDB(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

// Biến trạng thái toàn cục cho trang
let activePhotos = [];
let currentFilterTab = "tat-ca"; // tat-ca, hien-thi, an, mo, thich
let activeUploadTasks = []; // Lưu các timer đang giả lập để có thể cancel
let selectedPhotoForDetail = null; // Ảnh đang xem chi tiết

document.addEventListener("DOMContentLoaded", () => {
  // Lấy dữ liệu
  activePhotos = getPhotosFromDB();

  // Khai báo các phần tử DOM
  const cardGrid = document.querySelector(".card-grid");
  const fileInput = document.getElementById("photoFileInput");
  const uploadProgressModal = document.getElementById("uploadProgressModal");
  const uploadItemsContainer = document.getElementById("uploadItemsContainer");
  const btnCancelUpload = document.getElementById("btnCancelUpload");
  const btnFinishUpload = document.getElementById("btnFinishUpload");
  const closeUploadModal = document.getElementById("closeUploadModal");
  
  // Select lọc Album và Dự án
  const filterProjectSelect = document.getElementById("filterProjectSelect");
  const filterAlbumSelect = document.getElementById("filterAlbumSelect");
  const activeAlbumAlert = document.getElementById("activeAlbumAlert");

  // Detail modal elements
  const photoDetailModal = document.getElementById("photoDetailModal");
  const closeDetailModal = document.getElementById("closeDetailModal");
  const btnCloseDetail = document.getElementById("btnCloseDetail");
  const detailPhotoName = document.getElementById("detailPhotoName");
  const detailPhotoContainer = document.getElementById("detailPhotoContainer");
  const detailPhotoImg = document.getElementById("detailPhotoImg");
  const detailCloudinaryUrl = document.getElementById("detailCloudinaryUrl");
  const btnCopyCloudinaryUrl = document.getElementById("btnCopyCloudinaryUrl");
  const detailStatusBadge = document.getElementById("detailStatusBadge");
  const detailBlurScore = document.getElementById("detailBlurScore");
  const detailFaceCount = document.getElementById("detailFaceCount");
  const detailTagsList = document.getElementById("detailTagsList");
  const detailCommentsList = document.getElementById("detailCommentsList");
  const detailNewComment = document.getElementById("detailNewComment");
  const btnSubmitComment = document.getElementById("btnSubmitComment");

  // Ô tìm kiếm nhanh
  const searchInput = document.querySelector(".search");

  // Đọc Album từ URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const urlAlbum = urlParams.get("album");
  const urlUpload = urlParams.get("upload");

  if (urlAlbum && ["album_1", "album_2", "album_3"].includes(urlAlbum)) {
    if (filterAlbumSelect) filterAlbumSelect.value = urlAlbum;
    // Tự động đồng bộ dự án cha
    if (filterProjectSelect) {
      if (urlAlbum === "album_1") filterProjectSelect.value = "project_1";
      if (urlAlbum === "album_2") filterProjectSelect.value = "project_2";
      if (urlAlbum === "album_3") filterProjectSelect.value = "project_3";
    }
    
    // Nếu có param upload=true, tự động kích hoạt click chọn file
    if (urlUpload === "true" && fileInput) {
      setTimeout(() => {
        // Kiểm tra xem nút có ở trạng thái active không trước khi click
        if (filterAlbumSelect.value !== "all") {
          fileInput.click();
        }
      }, 400);
    }
  }

  // Cập nhật nhãn thông tin album đang xem
  function updateActiveAlbumLabel() {
    if (!activeAlbumAlert) return;
    const albumVal = filterAlbumSelect ? filterAlbumSelect.value : "all";
    const projVal = filterProjectSelect ? filterProjectSelect.value : "all";
    
    const uploadBtns = document.querySelectorAll("#btnUploadTopbar, #btnUploadPanel");

    if (albumVal !== "all") {
      const albumOpt = filterAlbumSelect.options[filterAlbumSelect.selectedIndex].text;
      activeAlbumAlert.innerHTML = `📂 Đang quản lý: <strong style="color: var(--green-2);">${albumOpt}</strong> <span style="font-size: 11px; color: var(--muted); font-weight: normal; margin-left: 8px;">(Sẵn sàng tải ảnh)</span>`;
      
      // Kích hoạt các nút upload ảnh
      uploadBtns.forEach(btn => {
        btn.classList.remove("disabled");
        btn.title = "Bấm để chọn và tải ảnh lên Album này";
      });
    } else {
      // Vô hiệu hóa các nút upload ảnh
      uploadBtns.forEach(btn => {
        btn.classList.add("disabled");
        btn.title = "Vui lòng chọn một Album cụ thể để tải ảnh lên";
      });

      if (projVal !== "all") {
        const projOpt = filterProjectSelect.options[filterProjectSelect.selectedIndex].text;
        activeAlbumAlert.innerHTML = `<span style="color: var(--red); font-weight: 500;">⚠️ Hãy chọn Album cụ thể thuộc "${projOpt}" để upload ảnh</span>`;
      } else {
        activeAlbumAlert.innerHTML = `<span style="color: var(--red); font-weight: 500;">⚠️ Vui lòng chọn một Album cụ thể để tải ảnh lên</span>`;
      }
    }
  }

  // Đồng bộ lựa chọn giữa Dự án và Album dropdowns
  if (filterProjectSelect && filterAlbumSelect) {
    filterProjectSelect.addEventListener("change", () => {
      const proj = filterProjectSelect.value;
      if (proj === "all") {
        // Reset Album select hiển thị tất cả
        filterAlbumSelect.value = "all";
        Array.from(filterAlbumSelect.options).forEach(opt => opt.style.display = "");
      } else {
        // Lọc Album thuộc dự án được chọn
        const targetAlbumId = proj === "project_1" ? "album_1" : proj === "project_2" ? "album_2" : "album_3";
        filterAlbumSelect.value = targetAlbumId;
        
        // Ẩn/Hiện các option khác trong dropdown để tăng tính logic
        Array.from(filterAlbumSelect.options).forEach(opt => {
          if (opt.value === "all" || opt.value === targetAlbumId) {
            opt.style.display = "";
          } else {
            opt.style.display = "none";
          }
        });
      }
      updateActiveAlbumLabel();
      renderPhotos();
    });

    filterAlbumSelect.addEventListener("change", () => {
      const album = filterAlbumSelect.value;
      if (album === "all") {
        filterProjectSelect.value = "all";
        Array.from(filterAlbumSelect.options).forEach(opt => opt.style.display = "");
      } else {
        // Đồng bộ dự án tương ứng
        if (album === "album_1") filterProjectSelect.value = "project_1";
        if (album === "album_2") filterProjectSelect.value = "project_2";
        if (album === "album_3") filterProjectSelect.value = "project_3";
      }
      updateActiveAlbumLabel();
      renderPhotos();
    });
  }

  updateActiveAlbumLabel();

  // Đổi hành vi của các nút upload ảnh để kích hoạt file input ẩn
  const uploadButtons = document.querySelectorAll("#btnUploadTopbar, #btnUploadPanel");
  uploadButtons.forEach(btn => {
    btn.removeAttribute("data-demo-alert");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Nếu nút bị disable do chưa chọn album
      if (btn.classList.contains("disabled")) {
        if (filterAlbumSelect) {
          // Tạo hiệu ứng rung lắc cho ô chọn Album để báo lỗi trực quan
          filterAlbumSelect.classList.add("shake-warning");
          setTimeout(() => {
            filterAlbumSelect.classList.remove("shake-warning");
          }, 450);
          filterAlbumSelect.focus();
        }
        alert("⚠️ Vui lòng chọn một Album cụ thể trong bộ lọc trước khi tải ảnh lên!");
        return;
      }
      
      fileInput.click();
    });
  });

  // Thiết lập Tab lọc
  const tabButtons = document.querySelectorAll(".tabs .tab");
  const filterMappings = ["tat-ca", "hien-thi", "an", "mo", "thich"];
  
  tabButtons.forEach((tab, index) => {
    const filterKey = filterMappings[index] || "tat-ca";
    tab.setAttribute("data-filter", filterKey);
    
    tab.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tab.classList.add("active");
      currentFilterTab = filterKey;
      renderPhotos();
    });
  });

  // Vẽ danh sách hình ảnh
  function renderPhotos() {
    if (!cardGrid) return;
    
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeProject = filterProjectSelect ? filterProjectSelect.value : "all";
    const activeAlbum = filterAlbumSelect ? filterAlbumSelect.value : "all";
    
    // Lấy dữ liệu mới nhất từ DB
    activePhotos = getPhotosFromDB();
    
    // Lọc theo Dự án & Album trước
    let filtered = activePhotos;
    if (activeAlbum !== "all") {
      filtered = filtered.filter(p => p.album_id === activeAlbum);
    } else if (activeProject !== "all") {
      // Map dự án sang các album tương ứng
      const allowedAlbums = activeProject === "project_1" ? ["album_1"] : activeProject === "project_2" ? ["album_2"] : ["album_3"];
      filtered = filtered.filter(p => allowedAlbums.includes(p.album_id));
    }
    
    // Lọc theo tab trạng thái
    filtered = filtered.filter(p => {
      if (currentFilterTab === "hien-thi") {
        return p.trang_thai === "HIEN_THI" || p.trang_thai === "DANG_SUA";
      } else if (currentFilterTab === "an") {
        return p.trang_thai === "AN";
      } else if (currentFilterTab === "mo") {
        return p.trang_thai === "MO";
      } else if (currentFilterTab === "thich") {
        return p.luot_thich > 0;
      }
      return true; // tat-ca
    });
    
    // Lọc theo thanh tìm kiếm
    if (query) {
      filtered = filtered.filter(p => {
        const matchName = p.ten_anh.toLowerCase().includes(query);
        const matchCloudinary = p.url_cloudinary.toLowerCase().includes(query);
        const matchTags = p.ai_meta.nhan.some(tag => tag.toLowerCase().includes(query));
        return matchName || matchCloudinary || matchTags;
      });
    }
    
    // Nếu không có ảnh nào
    if (filtered.length === 0) {
      cardGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; border: 1px dashed var(--line); border-radius: 20px; background: rgba(255,255,255,0.01)">
          <p style="color: var(--muted); font-size: 15px;">Không tìm thấy ảnh nào thuộc Album / điều kiện lọc hiện tại.</p>
        </div>
      `;
      return;
    }
    
    // Render thẻ HTML
    cardGrid.innerHTML = filtered.map(p => {
      let badgeHtml = "";
      if (p.trang_thai === "HIEN_THI") {
        badgeHtml = `<span class="badge green">Hiển thị</span>`;
      } else if (p.trang_thai === "DANG_SUA") {
        badgeHtml = `<span class="badge yellow">Đang sửa</span>`;
      } else if (p.trang_thai === "MO") {
        badgeHtml = `<span class="badge red">Ảnh mờ</span>`;
      } else if (p.trang_thai === "AN") {
        badgeHtml = `<span class="badge red" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: rgba(239, 68, 68, 0.3)">Bị ẩn</span>`;
      }
      
      const isHidden = p.trang_thai === "AN" || p.trang_thai === "MO";
      const toggleBtnText = isHidden ? "Hiện lại" : "Ẩn";
      
      // Tìm nhãn tên album để hiển thị trực quan cho admin
      let albumNameLabel = "";
      if (p.album_id === "album_1") albumNameLabel = "Ảnh gốc - 12A1";
      else if (p.album_id === "album_2") albumNameLabel = "Hậu kỳ - Cưới";
      else if (p.album_id === "album_3") albumNameLabel = "Final - Nàng thơ";
      else albumNameLabel = "Khác";

      const metaText = p.trang_thai === "MO" 
        ? `[${albumNameLabel}] · AI cảnh báo mờ · ${p.luot_thich} ♥`
        : `[${albumNameLabel}] · ${p.luot_thich} ♥ · ${p.phan_hoi.length} phản hồi`;

      return `
        <div class="photo-card" data-id="${p.ma_anh}">
          <div class="photo-thumb" style="background: url('${p.url}') center/cover no-repeat;"></div>
          <div class="card-body">
            <h3 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.ten_anh}">${p.ten_anh}</h3>
            <p class="meta" style="height: 38px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${metaText}
            </p>
            <div class="card-footer">
              ${badgeHtml}
              <button class="btn sm btn-detail" data-id="${p.ma_anh}">Chi tiết</button>
              <button class="btn sm btn-toggle-status" data-id="${p.ma_anh}">${toggleBtnText}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
    
    // Gắn sự kiện cho các nút trong thẻ
    document.querySelectorAll(".btn-detail").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openDetail(id);
      });
    });
    
    document.querySelectorAll(".btn-toggle-status").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        togglePhotoStatus(id);
      });
    });
  }

  // Khởi chạy render lần đầu
  renderPhotos();

  // Xử lý tìm kiếm nhanh
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderPhotos();
    });
  }

  // XỬ LÝ EVENT UPLOAD ẢNH GIẢ LẬP
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      // Mở modal tiến độ
      uploadProgressModal.classList.add("show");
      uploadItemsContainer.innerHTML = "";
      btnFinishUpload.disabled = true;
      btnCancelUpload.disabled = false;
      activeUploadTasks = [];

      // Xác định album đích sẽ tải lên
      const activeAlbum = filterAlbumSelect ? filterAlbumSelect.value : "all";
      const targetAlbumId = activeAlbum !== "all" ? activeAlbum : "album_1";
      const targetAlbumLabel = filterAlbumSelect.options[filterAlbumSelect.selectedIndex].text;
      
      const modalKicker = uploadProgressModal.querySelector(".section-kicker");
      if (modalKicker) {
        modalKicker.innerHTML = `Đang tải vào: <span style="color: var(--green-2);">${targetAlbumId !== "album_1" ? targetAlbumLabel : "Ảnh gốc (Kỷ yếu 12A1)"}</span>`;
      }

      // Render từng file vào hàng tiến độ
      const fileTasks = files.map((file, idx) => {
        const itemId = `upload-item-${idx}`;
        const itemHtml = `
          <div class="progress-item" id="${itemId}" style="border: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px;">
            <div class="progress-top">
              <div style="flex: 1; min-width: 0;">
                <strong style="font-size: 14px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90%;" title="${file.name}">${file.name}</strong>
                <span class="upload-status" style="font-size: 12px; color: var(--muted);">Đang chuẩn bị...</span>
              </div>
              <span class="progress-percentage" style="font-size: 13px; font-weight: 700; color: var(--green-2);">0%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%;"></div>
            </div>
            <div class="ai-processing-status" style="margin-top: 10px; font-size: 12px; color: var(--yellow); display: none;">
              <span class="spinner">✦</span>
              <span class="ai-text">AI đang phân tích độ mờ & khuôn mặt...</span>
            </div>
          </div>
        `;
        uploadItemsContainer.insertAdjacentHTML("beforeend", itemHtml);
        return { file, itemId, completed: false };
      });

      // Bắt đầu giả lập upload
      fileTasks.forEach((task, idx) => {
        simulateSingleFileUpload(task, idx, fileTasks, targetAlbumId);
      });
    });
  }

  function simulateSingleFileUpload(task, index, allTasks, targetAlbumId) {
    const itemEl = document.getElementById(task.itemId);
    if (!itemEl) return;
    
    const progressFill = itemEl.querySelector(".progress-fill");
    const progressPercent = itemEl.querySelector(".progress-percentage");
    const statusText = itemEl.querySelector(".upload-status");
    const aiStatusDiv = itemEl.querySelector(".ai-processing-status");
    const aiText = itemEl.querySelector(".ai-text");

    let progress = 0;
    statusText.textContent = "Đang tải lên Cloudinary...";
    
    const startDelay = index * 200; 
    
    const startTimer = setTimeout(() => {
      const uploadInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);
          
          statusText.textContent = "☁ Đã lưu Cloudinary URL";
          statusText.style.color = "var(--green-2)";
          aiStatusDiv.style.display = "block";
          
          const aiTimer = setTimeout(() => {
            const isBlur = Math.random() > 0.85; 
            const numFaces = Math.floor(Math.random() * 3);
            const blurScore = isBlur ? Math.floor(Math.random() * 25) + 70 : Math.floor(Math.random() * 15) + 5;
            
            let resultText = `✓ AI hoàn tất! Quét độ mờ: ${blurScore}% (Đạt chuẩn)`;
            let finalStatus = "HIEN_THI";
            
            if (isBlur) {
              resultText = `⚠ AI cảnh báo: Ảnh mờ (${blurScore}%). Tự động gắn nhãn cảnh báo.`;
              aiStatusDiv.style.color = "var(--red)";
              finalStatus = "MO";
            } else {
              aiStatusDiv.style.color = "var(--green-2)";
            }
            
            if (numFaces > 0) {
              resultText += ` · Phát hiện ${numFaces} khuôn mặt.`;
            }
            
            aiText.textContent = resultText;
            aiStatusDiv.querySelector(".spinner").textContent = "✓";
            aiStatusDiv.querySelector(".spinner").classList.remove("spinner");
            
            // Đưa ảnh vào Database LocalStorage với đúng album_id
            saveUploadedPhotoToDB(task.file, finalStatus, blurScore, numFaces, targetAlbumId);
            
            task.completed = true;
            checkAllUploadsComplete(allTasks);
          }, 1200);
          
          activeUploadTasks.push(aiTimer);
        }
        
        progressFill.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
      }, 100);
      
      activeUploadTasks.push(uploadInterval);
    }, startDelay);
    
    activeUploadTasks.push(startDelay);
  }

  function checkAllUploadsComplete(tasks) {
    const allDone = tasks.every(t => t.completed);
    if (allDone) {
      btnFinishUpload.disabled = false;
      btnCancelUpload.disabled = true;
      renderPhotos();
    }
  }

  function saveUploadedPhotoToDB(file, status, blurScore, numFaces, targetAlbumId) {
    const photos = getPhotosFromDB();
    
    const possibleTags = ["Ngoại cảnh", "Chân dung", "Cô dâu", "Chú rể", "Gia đình", "Bạn bè", "Nụ cười"];
    const tags = ["Tải lên mới"];
    
    // Gán 1-2 tag ngẫu nhiên
    const tCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < tCount; i++) {
      const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }
    
    const boxes = [];
    if (numFaces === 1) {
      boxes.push({ top: 20, left: 40, width: 15, height: 18, label: "Face #1 (94%)" });
    } else if (numFaces === 2) {
      boxes.push({ top: 22, left: 30, width: 12, height: 15, label: "Face #1 (96%)" });
      boxes.push({ top: 25, left: 52, width: 12, height: 16, label: "Face #2 (91%)" });
    }

    const objectUrl = URL.createObjectURL(file);
    const newPhoto = {
      ma_anh: `photo_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      album_id: targetAlbumId, // Lưu vào đúng album đã chọn
      ten_anh: file.name,
      url: objectUrl,
      url_cloudinary: `https://res.cloudinary.com/noofoto/image/upload/v17794828/${encodeURIComponent(file.name)}`,
      trang_thai: status,
      luot_thich: 0,
      ai_meta: {
        do_mo: blurScore,
        nhan: tags,
        so_khuon_mat: numFaces,
        khuon_mat_boxes: boxes
      },
      phan_hoi: []
    };
    
    photos.unshift(newPhoto);
    savePhotosToDB(photos);
  }

  // Tắt/Đóng Upload Modal
  function closeUpload() {
    activeUploadTasks.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    activeUploadTasks = [];
    uploadProgressModal.classList.remove("show");
    if (fileInput) fileInput.value = "";
    renderPhotos();
  }

  if (closeUploadModal) closeUploadModal.addEventListener("click", closeUpload);
  if (btnCancelUpload) btnCancelUpload.addEventListener("click", closeUpload);
  if (btnFinishUpload) btnFinishUpload.addEventListener("click", closeUpload);
  
  if (uploadProgressModal) {
    uploadProgressModal.addEventListener("click", (e) => {
      if (e.target === uploadProgressModal && btnFinishUpload.disabled === false) {
        closeUpload();
      }
    });
  }

  // XỬ LÝ ẨN / HIỆN ẢNH
  function togglePhotoStatus(id) {
    const photos = getPhotosFromDB();
    const photo = photos.find(p => p.ma_anh === id);
    if (!photo) return;
    
    if (photo.trang_thai === "AN" || photo.trang_thai === "MO") {
      photo.trang_thai = "HIEN_THI";
    } else {
      photo.trang_thai = "AN";
    }
    
    savePhotosToDB(photos);
    renderPhotos();
  }

  // XỬ LÝ CHI TIẾT ẢNH (MODAL DETAIL)
  function openDetail(id) {
    const photos = getPhotosFromDB();
    selectedPhotoForDetail = photos.find(p => p.ma_anh === id);
    if (!selectedPhotoForDetail) return;
    
    const p = selectedPhotoForDetail;
    
    detailPhotoName.textContent = p.ten_anh;
    detailPhotoImg.src = p.url;
    detailCloudinaryUrl.value = p.url_cloudinary;
    
    let badgeLabel = "Hiển thị";
    let badgeClass = "badge green";
    if (p.trang_thai === "DANG_SUA") {
      badgeLabel = "Đang sửa";
      badgeClass = "badge yellow";
    } else if (p.trang_thai === "MO") {
      badgeLabel = "Ảnh mờ";
      badgeClass = "badge red";
    } else if (p.trang_thai === "AN") {
      badgeLabel = "Đã ẩn";
      badgeClass = "badge red";
    }
    detailStatusBadge.className = badgeClass;
    detailStatusBadge.textContent = badgeLabel;
    
    const isBlurred = p.ai_meta.do_mo >= 60;
    detailBlurScore.innerHTML = `<span style="color: ${isBlurred ? 'var(--red)' : 'var(--green-2)'}; font-weight: 700;">${p.ai_meta.do_mo}%</span> (${isBlurred ? 'Cảnh báo mờ' : 'Đạt chuẩn sắc nét'})`;
    
    detailFaceCount.textContent = `${p.ai_meta.so_khuon_mat} khuôn mặt được nhận diện`;
    
    const oldBoxes = detailPhotoContainer.querySelectorAll(".face-box");
    oldBoxes.forEach(b => b.remove());
    
    if (p.ai_meta.khuon_mat_boxes && p.ai_meta.khuon_mat_boxes.length > 0) {
      p.ai_meta.khuon_mat_boxes.forEach(box => {
        const boxEl = document.createElement("div");
        boxEl.className = "face-box";
        boxEl.style.top = `${box.top}%`;
        boxEl.style.left = `${box.left}%`;
        boxEl.style.width = `${box.width}%`;
        boxEl.style.height = `${box.height}%`;
        boxEl.setAttribute("data-label", box.label || "Khuôn mặt");
        
        detailPhotoContainer.appendChild(boxEl);
      });
    }
    
    detailTagsList.innerHTML = p.ai_meta.nhan.map(tag => {
      return `<span class="badge gray" style="background: rgba(255,255,255,0.06); border: 1px solid var(--line); font-size: 11px;"># ${tag}</span>`;
    }).join("");
    
    renderComments();
    photoDetailModal.classList.add("show");
  }

  function renderComments() {
    if (!selectedPhotoForDetail) return;
    const p = selectedPhotoForDetail;
    const title = photoDetailModal.querySelector("h3[style*='var(--blue)']");
    if (title) {
      title.textContent = `💬 Phản hồi chọn ảnh (${p.phan_hoi.length})`;
    }
    
    if (p.phan_hoi.length === 0) {
      detailCommentsList.innerHTML = `
        <div style="text-align: center; color: var(--muted-2); font-size: 12px; margin: auto; padding: 20px;">
          Chưa có phản hồi hoặc yêu cầu chỉnh sửa cho ảnh này.
        </div>
      `;
      return;
    }
    
    detailCommentsList.innerHTML = p.phan_hoi.map((c, index) => {
      let adminReplyHtml = "";
      if (c.phan_hoi_admin) {
        adminReplyHtml = `
          <div class="comment-bubble admin-reply" style="margin-top: 6px;">
            <div class="comment-meta">
              <strong>Studio (Admin)</strong>
              <span>Phản hồi lúc đó</span>
            </div>
            <div class="comment-body">${c.phan_hoi_admin}</div>
          </div>
        `;
      } else {
        adminReplyHtml = `
          <div style="margin-left: 16px; margin-top: 4px;">
            <button class="btn sm btn-reply-comment" data-idx="${index}" style="font-size: 11px; padding: 4px 8px; border-radius: 6px; background: rgba(96, 165, 250, 0.1); color: var(--blue);">Trả lời phản hồi này...</button>
          </div>
        `;
      }
      
      return `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div class="comment-bubble">
            <div class="comment-meta">
              <strong style="color: var(--blue);">${c.khach_hang}</strong>
              <span>${c.thoi_gian}</span>
            </div>
            <div class="comment-body">${c.noi_dung}</div>
          </div>
          ${adminReplyHtml}
        </div>
      `;
    }).join("");
    
    detailCommentsList.querySelectorAll(".btn-reply-comment").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        const replyText = prompt("Nhập phản hồi từ Studio cho ý kiến này:");
        if (replyText && replyText.trim()) {
          const photos = getPhotosFromDB();
          const dbP = photos.find(item => item.ma_anh === p.ma_anh);
          if (dbP && dbP.phan_hoi[idx]) {
            dbP.phan_hoi[idx].phan_hoi_admin = replyText.trim();
            savePhotosToDB(photos);
            
            selectedPhotoForDetail = dbP;
            renderComments();
            renderPhotos();
          }
        }
      });
    });
  }

  function closeDetail() {
    photoDetailModal.classList.remove("show");
    selectedPhotoForDetail = null;
  }
  
  if (closeDetailModal) closeDetailModal.addEventListener("click", closeDetail);
  if (btnCloseDetail) btnCloseDetail.addEventListener("click", closeDetail);
  
  if (photoDetailModal) {
    photoDetailModal.addEventListener("click", (e) => {
      if (e.target === photoDetailModal) {
        closeDetail();
      }
    });
  }

  if (btnSubmitComment && detailNewComment) {
    btnSubmitComment.addEventListener("click", () => {
      submitNewComment();
    });
    
    detailNewComment.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        submitNewComment();
      }
    });
  }

  function submitNewComment() {
    if (!selectedPhotoForDetail || !detailNewComment) return;
    const text = detailNewComment.value.trim();
    if (!text) return;
    
    const photos = getPhotosFromDB();
    const dbP = photos.find(item => item.ma_anh === selectedPhotoForDetail.ma_anh);
    if (!dbP) return;
    
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    dbP.phan_hoi.push({
      khach_hang: "Studio (Lưu ý nội bộ)",
      noi_dung: text,
      thoi_gian: dateStr,
      phan_hoi_admin: "Đã ghi nhận lưu ý."
    });
    
    savePhotosToDB(photos);
    selectedPhotoForDetail = dbP;
    detailNewComment.value = "";
    renderComments();
    renderPhotos();
  }

  if (btnCopyCloudinaryUrl && detailCloudinaryUrl) {
    btnCopyCloudinaryUrl.addEventListener("click", () => {
      detailCloudinaryUrl.select();
      navigator.clipboard.writeText(detailCloudinaryUrl.value)
        .then(() => {
          const oldText = btnCopyCloudinaryUrl.textContent;
          btnCopyCloudinaryUrl.textContent = "✓ Copied!";
          btnCopyCloudinaryUrl.style.borderColor = "var(--line-green)";
          setTimeout(() => {
            btnCopyCloudinaryUrl.textContent = oldText;
            btnCopyCloudinaryUrl.style.borderColor = "";
          }, 1500);
        })
        .catch(err => {
          console.error("Lỗi sao chép URL: ", err);
        });
    });
  }
});
