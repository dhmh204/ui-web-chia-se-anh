
const current = location.pathname.split("/").pop() || "index.html";

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

// Khởi tạo Flatpickr cho ô Chọn Ngày với giao diện Tiếng Việt
if (typeof flatpickr !== "undefined" && document.querySelector("#ngay-chup")) {
  flatpickr("#ngay-chup", {
    dateFormat: "d/m/Y",
    defaultDate: "24/05/2026",
    allowInput: false,
    changeMonth: true,
    changeYear: true,
    locale: {
      firstDayOfWeek: 1, // Bắt đầu tuần từ thứ 2
      weekdays: {
        shorthand: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        longhand: [
          "Chủ Nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy"
        ]
      },
      months: {
        shorthand: [
          "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
          "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"
        ],
        longhand: [
          "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
          "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        ]
      }
    }
  });
}

// Giả lập Database khách hàng cũ
const mockCustomers = {
  "0987654321": "Nguyễn Hoàng Minh",
  "0912345678": "Lớp 12A1 - THPT Chu Văn An",
  "0909090909": "Anh Tú & Chị Lan (Cưới)"
};

const inputSdt = document.querySelector("#khach-sdt");
const inputTen = document.querySelector("#khach-ten");
const feedbackSdt = document.querySelector("#sdt-feedback");

if (inputSdt && inputTen && feedbackSdt) {
  inputSdt.addEventListener("input", (e) => {
    let sdt = e.target.value.trim();
    
    // Chỉ giữ lại ký số
    sdt = sdt.replace(/\D/g, "");
    e.target.value = sdt; // Cập nhật lại giá trị input chỉ gồm số
    
    if (sdt.length === 0) {
      feedbackSdt.textContent = "";
      feedbackSdt.className = "field-feedback";
      inputTen.value = "";
      inputTen.disabled = true;
      inputTen.placeholder = "Nhập số điện thoại trước...";
      return;
    }
    
    // Kiểm tra định dạng cơ bản của số điện thoại Việt Nam (ví dụ 10 số, bắt đầu bằng 0)
    const isValidPhone = /^0\d{9}$/.test(sdt);
    
    if (sdt.length < 10) {
      feedbackSdt.textContent = "Đang nhập số điện thoại...";
      feedbackSdt.className = "field-feedback info";
      inputTen.value = "";
      inputTen.disabled = true;
      inputTen.placeholder = "Nhập đủ 10 số...";
      return;
    }
    
    if (!isValidPhone) {
      feedbackSdt.textContent = "⚠ Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và đủ 10 số)";
      feedbackSdt.className = "field-feedback error";
      inputTen.value = "";
      inputTen.disabled = true;
      inputTen.placeholder = "Số điện thoại sai định dạng";
      return;
    }
    
    // Nếu đủ 10 số và hợp lệ -> Tìm trong cơ sở dữ liệu
    let customerName = null;
    let isVip = false;
    
    try {
      const stored = localStorage.getItem("noofoto_customers");
      if (stored) {
        const dbList = JSON.parse(stored);
        const found = dbList.find(c => c.so_dien_thoai === sdt);
        if (found) {
          customerName = found.ho_va_ten;
          isVip = found.diem_tich_luy >= 200;
        }
      }
    } catch(e) {
      console.error("Lỗi đọc CSDL khách hàng từ localStorage", e);
    }
    
    if (!customerName) {
      customerName = mockCustomers[sdt];
      if (customerName) {
        isVip = sdt === "0909090909" || sdt === "0987654321";
      }
    }

    if (customerName) {
      const vipText = isVip ? " (Khách hàng VIP)" : " (Khách hàng thân thiết)";
      feedbackSdt.textContent = `✓ Tìm thấy khách hàng cũ${vipText}`;
      feedbackSdt.className = "field-feedback success";
      inputTen.value = customerName;
      inputTen.disabled = false;
      inputTen.readOnly = true;
      inputTen.style.borderColor = "var(--line-green)";
    } else {
      feedbackSdt.textContent = `✦ Khách hàng mới! Vui lòng nhập tên khách hàng bên dưới`;
      feedbackSdt.className = "field-feedback info";
      inputTen.value = "";
      inputTen.disabled = false;
      inputTen.readOnly = false;
      inputTen.placeholder = "Nhập tên khách hàng mới...";
      inputTen.focus();
      inputTen.style.borderColor = "";
    }
  });
}

// Thư viện ảnh bìa mặc định ngẫu nhiên
const presetCovers = [
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=60", // Cưới hỏi 1
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60", // Kỷ yếu
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=60", // Cưới hỏi ngoài trời
  "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?w=800&auto=format&fit=crop&q=60", // Cặp đôi ngoại cảnh
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=60"  // Chân dung studio
];

let selectedCoverUrl = presetCovers[0];

const btnRandomCover = document.getElementById("btn-random-cover");
const btnUploadCover = document.getElementById("btn-upload-cover");
const inputUploadCover = document.getElementById("input-upload-cover");
const coverPreviewImg = document.getElementById("cover-preview-img");
const coverFeedback = document.getElementById("cover-feedback");

// Chọn ảnh ngẫu nhiên
if (btnRandomCover && coverPreviewImg && coverFeedback) {
  btnRandomCover.addEventListener("click", () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * presetCovers.length);
    } while (presetCovers[randomIndex] === selectedCoverUrl && presetCovers.length > 1);
    
    selectedCoverUrl = presetCovers[randomIndex];
    coverPreviewImg.src = selectedCoverUrl;
    coverFeedback.textContent = "✦ Đã chọn ảnh ngẫu nhiên từ thư viện.";
    coverFeedback.className = "field-feedback success";
  });
}

// Click nút Tải ảnh lên -> Kích hoạt input file ẩn
if (btnUploadCover && inputUploadCover) {
  btnUploadCover.addEventListener("click", () => {
    inputUploadCover.click();
  });
}

// Xử lý khi chọn file ảnh từ máy tính
if (inputUploadCover && coverPreviewImg && coverFeedback) {
  inputUploadCover.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Đảm bảo là file ảnh
      if (!file.type.startsWith("image/")) {
        coverFeedback.textContent = "⚠ Vui lòng chọn file định dạng hình ảnh.";
        coverFeedback.className = "field-feedback error";
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      selectedCoverUrl = objectUrl;
      coverPreviewImg.src = objectUrl;
      coverFeedback.textContent = `✓ Đã tải lên file: ${file.name}`;
      coverFeedback.className = "field-feedback success";
    }
  });
}

// QUẢN LÝ MODAL THÀNH CÔNG VÀ SUBMIT FORM
const createProjectForm = document.getElementById("createProjectForm");
const projectSuccessModal = document.getElementById("projectSuccessModal");
const closeProjectModal = document.getElementById("closeProjectModal");
const doneProjectModal = document.getElementById("doneProjectModal");
const copyShareLink = document.getElementById("copyShareLink");
const projectTableBody = document.getElementById("projectTableBody");

// Element điền thông tin modal
const modalProjName = document.getElementById("modalProjName");
const modalProjPhone = document.getElementById("modalProjPhone");
const modalProjCustomer = document.getElementById("modalProjCustomer");
const modalProjDate = document.getElementById("modalProjDate");
const modalProjPassword = document.getElementById("modalProjPassword");
const modalProjStaff = document.getElementById("modalProjStaff");
const modalProjCoverImg = document.getElementById("modalProjCoverImg");
const modalProjShareLink = document.getElementById("modalProjShareLink");

let pendingProjectData = null; // Lưu trữ tạm thời để đẩy vào bảng khi click 'Hoàn tất'

if (createProjectForm && projectSuccessModal) {
  createProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Thu thập dữ liệu
    const projName = document.getElementById("proj-name").value.trim();
    const projDate = document.getElementById("ngay-chup").value.trim();
    const projPhone = document.getElementById("khach-sdt").value.trim();
    const projCustomer = document.getElementById("khach-ten").value.trim();
    const projPass = document.getElementById("proj-pass").value.trim() || "(Không thiết lập)";
    const projStaff = document.getElementById("proj-staff").value;
    
    // Sinh mã album ngẫu nhiên
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const shareLink = `https://noofoto.vn/album/${randomCode}`;
    
    // Gán dữ liệu vào modal
    if (modalProjName) modalProjName.textContent = projName;
    if (modalProjPhone) modalProjPhone.textContent = projPhone;
    if (modalProjCustomer) modalProjCustomer.textContent = projCustomer;
    if (modalProjDate) modalProjDate.textContent = projDate;
    if (modalProjPassword) modalProjPassword.textContent = projPass;
    if (modalProjStaff) modalProjStaff.textContent = projStaff;
    if (modalProjCoverImg) modalProjCoverImg.src = selectedCoverUrl;
    if (modalProjShareLink) modalProjShareLink.textContent = shareLink;
    
    // Lưu tạm data
    pendingProjectData = {
      name: projName,
      customer: projCustomer,
      staff: projStaff,
      date: projDate
    };
    
    // Hiển thị modal
    projectSuccessModal.classList.add("show");
  });
}

// Đóng modal
function closeProjModal() {
  if (projectSuccessModal) {
    projectSuccessModal.classList.remove("show");
  }
}

if (closeProjectModal) {
  closeProjectModal.addEventListener("click", closeProjModal);
}

// Click Hoàn tất -> Thêm hàng mới vào bảng dự án và reset form
if (doneProjectModal) {
  doneProjectModal.addEventListener("click", () => {
    closeProjModal();
    
    if (pendingProjectData && projectTableBody) {
      // Tạo hàng mới trong bảng
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pendingProjectData.name}</td>
        <td>${pendingProjectData.customer}</td>
        <td>${pendingProjectData.staff}</td>
        <td>${pendingProjectData.date}</td>
        <td><span class="badge blue">Mới</span></td>
        <td class="action-row">
          <a class="btn sm" href="albums.html">Album</a>
          <button class="btn sm">Sửa</button>
        </td>
      `;
      // Thêm vào đầu bảng
      projectTableBody.insertBefore(tr, projectTableBody.firstChild);
      
      // Hiệu ứng highlight hàng mới
      tr.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      tr.style.transition = "background-color 1s ease";
      setTimeout(() => {
        tr.style.backgroundColor = "";
      }, 1500);
    }
    
    // Reset Form
    if (createProjectForm) {
      createProjectForm.reset();
      
      // Khóa lại ô tên khách hàng
      const inputTen = document.getElementById("khach-ten");
      if (inputTen) {
        inputTen.disabled = true;
        inputTen.placeholder = "Nhập số điện thoại trước...";
        inputTen.style.borderColor = "";
      }
      
      // Reset ảnh bìa
      selectedCoverUrl = presetCovers[0];
      if (coverPreviewImg) coverPreviewImg.src = selectedCoverUrl;
      if (coverFeedback) {
        coverFeedback.textContent = "Đã chọn ảnh bìa mặc định. Bạn có thể chọn ngẫu nhiên ảnh khác hoặc tải file lên.";
        coverFeedback.className = "field-feedback info";
      }
      
      // Reset flatpickr date
      const dateInput = document.getElementById("ngay-chup");
      if (dateInput && dateInput._flatpickr) {
        dateInput._flatpickr.setDate("24/05/2026");
      }
      
      // Reset feedback SDT
      const sdtFeedback = document.getElementById("sdt-feedback");
      if (sdtFeedback) {
        sdtFeedback.textContent = "";
        sdtFeedback.className = "field-feedback";
      }
    }
    
    pendingProjectData = null;
  });
}

// Copy link chia sẻ
if (copyShareLink && modalProjShareLink) {
  copyShareLink.addEventListener("click", () => {
    navigator.clipboard.writeText(modalProjShareLink.textContent.trim())
      .then(() => {
        const oldText = copyShareLink.textContent;
        copyShareLink.textContent = "✓ Đã copy!";
        copyShareLink.style.borderColor = "var(--line-green)";
        setTimeout(() => {
          copyShareLink.textContent = oldText;
          copyShareLink.style.borderColor = "";
        }, 1500);
      })
      .catch(err => {
        console.error("Lỗi copy link: ", err);
      });
  });
}

// Click overlay để đóng modal
if (projectSuccessModal) {
  projectSuccessModal.addEventListener("click", (e) => {
    if (e.target === projectSuccessModal) {
      closeProjModal();
    }
  });
}

// Click nút "+ Tạo dự án" ở Topbar -> Cuộn xuống form và focus
const btnTopbarCreateProject = document.getElementById("btn-topbar-create-project");
if (btnTopbarCreateProject) {
  btnTopbarCreateProject.addEventListener("click", () => {
    const formElement = document.getElementById("createProjectForm");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
      const inputName = document.getElementById("proj-name");
      if (inputName) {
        setTimeout(() => inputName.focus(), 400);
      }
    }
  });
}
