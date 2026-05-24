document.addEventListener("DOMContentLoaded", function () {
  // --- MOCK DATABASE SEED DATA ---
  const seedCustomers = [
    {
      ma_khach_hang: "c4ca4238-a0b9-3ad1-d9a2-7ba214011140",
      ho_va_ten: "Nguyễn Hoàng Minh",
      so_dien_thoai: "0987654321",
      email: "minh.hoang@gmail.com",
      du_an_lien_ket: "project_2", // Cưới Hoàng & Linh
      so_lan_dat_lich: 2, // 2 lần chụp
      ngay_tao: "2025-05-15T10:30:00Z"
    },
    {
      ma_khach_hang: "c81e728d-9d4c-2f1d-5444-2ee60f269df9",
      ho_va_ten: "Phạm Thùy Linh",
      so_dien_thoai: "0912345678",
      email: "thuylinh.pham@gmail.com",
      du_an_lien_ket: "project_2", // Cưới Hoàng & Linh
      so_lan_dat_lich: 1,
      ngay_tao: "2026-02-12T14:20:00Z"
    },
    {
      ma_khach_hang: "eccbc87e-4b5c-e2fe-2830-8fd107074aba",
      ho_va_ten: "Trần Anh Tuấn",
      so_dien_thoai: "0909090909",
      email: "tuan.tran@yahoo.com",
      du_an_lien_ket: "project_3", // Concept nàng thơ
      so_lan_dat_lich: 3, // 3 lần chụp
      ngay_tao: "2024-11-20T08:15:00Z"
    },
    {
      ma_khach_hang: "a87ff679-a2f3-e231-1100-3453a2323ef4",
      ho_va_ten: "Lê Thị Thu Hà",
      so_dien_thoai: "0945678901",
      email: "thuha.le@gmail.com",
      du_an_lien_ket: "project_1", // Kỷ yếu 12A1
      so_lan_dat_lich: 1,
      ngay_tao: "2026-05-01T09:00:00Z"
    },
    {
      ma_khach_hang: "e4da3b7f-bbf2-5203-128a-77ffc2e12a9a",
      ho_va_ten: "Vũ Quốc Huy",
      so_dien_thoai: "0977889900",
      email: "quochuy.vu@outlook.com",
      du_an_lien_ket: "none", // Chưa liên kết dự án
      so_lan_dat_lich: 0,
      ngay_tao: "2026-05-20T16:45:00Z"
    }
  ];

  const projectMap = {
    project_1: "Kỷ yếu 12A1",
    project_2: "Cưới Hoàng & Linh",
    project_3: "Concept nàng thơ",
    none: "Chưa liên kết"
  };

  // --- LOCAL STORAGE DATA HANDLING ---
  function getCustomers() {
    const data = localStorage.getItem("noofoto_customers");
    if (!data) {
      localStorage.setItem("noofoto_customers", JSON.stringify(seedCustomers));
      return seedCustomers;
    }
    return JSON.parse(data);
  }

  function saveCustomers(customers) {
    localStorage.setItem("noofoto_customers", JSON.stringify(customers));
    updateStats();
    renderTable();
  }

  // --- DOM ELEMENTS ---
  const customerForm = document.getElementById("customerForm");
  const customerTableBody = document.getElementById("customerTableBody");
  const emptyTableState = document.getElementById("emptyTableState");

  // Inputs
  const customerIdInput = document.getElementById("customerId");
  const customerNameInput = document.getElementById("customerName");
  const customerPhoneInput = document.getElementById("customerPhone");
  const customerEmailInput = document.getElementById("customerEmail");
  const customerProjectLinkSelect = document.getElementById("customerProjectLink");
  const customerBookingsInput = document.getElementById("customerBookings");

  // Buttons & Labels
  const btnSubmitCustomer = document.getElementById("btnSubmitCustomer");
  const btnCancelEdit = document.getElementById("btnCancelEdit");
  const btnFocusForm = document.getElementById("btnFocusForm");
  const btnResetMockDb = document.getElementById("btnResetMockDb");
  const formTitle = document.getElementById("formTitle");
  const formKicker = document.getElementById("formKicker");

  // Search & Filter
  const customerSearchInput = document.getElementById("customerSearchInput");
  const filterProject = document.getElementById("filterProject");
  const sortField = document.getElementById("sortField");

  // Stats
  const statTotalCustomers = document.getElementById("statTotalCustomers");
  const statReturningRate = document.getElementById("statReturningRate");
  const statTotalBookings = document.getElementById("statTotalBookings");
  const statLoyalCustomer = document.getElementById("statLoyalCustomer");

  // Modal Dialog
  const messageModal = document.getElementById("messageModal");
  const closeModal = document.getElementById("closeModal");
  const btnModalOk = document.getElementById("btnModalOk");
  const modalTitle = document.getElementById("modalTitle");
  const modalKicker = document.getElementById("modalKicker");
  const modalContentHeading = document.getElementById("modalContentHeading");
  const modalContentText = document.getElementById("modalContentText");

  // --- CORE LOGIC & RENDERING ---
  
  // Calculate and update top stats card panel
  function updateStats() {
    const list = getCustomers();
    
    // 1. Total count
    if (statTotalCustomers) {
      statTotalCustomers.textContent = String(list.length).padStart(2, "0");
    }

    // 2. Returning Customer Rate (customers with >= 2 bookings)
    if (statReturningRate) {
      if (list.length > 0) {
        const returningCount = list.filter(c => c.so_lan_dat_lich && c.so_lan_dat_lich >= 2).length;
        const rate = Math.round((returningCount / list.length) * 100);
        statReturningRate.textContent = `${rate}%`;
      } else {
        statReturningRate.textContent = "0%";
      }
    }

    // 3. Total Bookings (sum of all bookings)
    if (statTotalBookings) {
      const sumBookings = list.reduce((sum, c) => sum + (c.so_lan_dat_lich || 0), 0);
      statTotalBookings.textContent = String(sumBookings).padStart(2, "0");
    }

    // 4. Most Loyal Customer
    if (statLoyalCustomer) {
      const activeCustomers = list.filter(c => c.so_lan_dat_lich && c.so_lan_dat_lich > 0);
      if (activeCustomers.length > 0) {
        let maxCust = activeCustomers[0];
        for (let i = 1; i < activeCustomers.length; i++) {
          if (activeCustomers[i].so_lan_dat_lich > maxCust.so_lan_dat_lich) {
            maxCust = activeCustomers[i];
          }
        }
        statLoyalCustomer.textContent = maxCust.ho_va_ten;
        statLoyalCustomer.title = `${maxCust.ho_va_ten} (${maxCust.so_lan_dat_lich} lần chụp)`;
      } else {
        statLoyalCustomer.textContent = "Chưa có";
        statLoyalCustomer.title = "Chưa có";
      }
    }
  }

  // Get project badge HTML
  function getProjectBadge(projId) {
    if (projId === "project_1") {
      return `<span class="project-badge proj-1">Kỷ yếu 12A1</span>`;
    } else if (projId === "project_2") {
      return `<span class="project-badge proj-2">Cưới Hoàng & Linh</span>`;
    } else if (projId === "project_3") {
      return `<span class="project-badge proj-3">Concept nàng thơ</span>`;
    } else {
      return `<span class="project-badge proj-none">Chưa gán</span>`;
    }
  }

  // Format date helper: returns dd/mm/yyyy hh:mm or just dd/mm/yyyy
  function formatDate(isoString) {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Chưa rõ";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Get initials for Avatar background display
  function getInitials(name) {
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return `${first}${last}`.toUpperCase();
  }

  // Generate color palette based on client name to make avatars look dynamic and colorful
  function getAvatarColor(name) {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [160, 200, 240, 280, 320, 20, 50, 100];
    const chosenHue = hues[hash % hues.length];
    return `hsl(${chosenHue}, 60%, 42%)`;
  }

  // Render the table data based on current search query, category filter and sorting option
  function renderTable() {
    const list = getCustomers();
    const query = customerSearchInput.value.toLowerCase().trim();
    const projectFilter = filterProject.value;
    const sort = sortField.value;

    // Filter
    let filteredList = list.filter(cust => {
      // 1. Search Query filter (matches name, phone, or email)
      const matchesSearch = cust.ho_va_ten.toLowerCase().includes(query) || 
                            cust.so_dien_thoai.includes(query) ||
                            (cust.email && cust.email.toLowerCase().includes(query));

      // 2. Project filter matching
      let matchesProj = true;
      if (projectFilter !== "ALL") {
        const linkedProj = cust.du_an_lien_ket || "none";
        matchesProj = linkedProj === projectFilter;
      }

      return matchesSearch && matchesProj;
    });

    // Sort
    filteredList.sort((a, b) => {
      const [field, direction] = sort.split("-");
      const isDesc = direction === "desc";

      if (field === "ngay_tao") {
        const dateA = new Date(a.ngay_tao).getTime();
        const dateB = new Date(b.ngay_tao).getTime();
        return isDesc ? dateB - dateA : dateA - dateB;
      } else if (field === "ho_va_ten") {
        return a.ho_va_ten.localeCompare(b.ho_va_ten, "vi");
      }
      return 0;
    });

    // Check empty state
    if (filteredList.length === 0) {
      customerTableBody.innerHTML = "";
      emptyTableState.style.display = "block";
      return;
    }
    emptyTableState.style.display = "none";

    // Build row elements
    let html = "";
    filteredList.forEach(cust => {
      const initials = getInitials(cust.ho_va_ten);
      const avatarColor = getAvatarColor(cust.ho_va_ten);
      const projBadge = getProjectBadge(cust.du_an_lien_ket || "none");
      const emailText = cust.email ? cust.email : `<span style="color:var(--muted-2); font-style:italic;">Chưa có Email</span>`;
      const bookingsCount = cust.so_lan_dat_lich !== undefined ? cust.so_lan_dat_lich : 1;

      html += `
        <tr>
          <td>
            <div class="staff-inline">
              <div class="avatar" style="background-color: ${avatarColor};">${initials}</div>
              <div>
                <strong>${escapeHtml(cust.ho_va_ten)}</strong>
                <p>Ngày tạo: ${formatDate(cust.ngay_tao)}</p>
              </div>
            </div>
          </td>
          <td>
            <code style="color: var(--green-2); font-size:14px; font-weight:600;">${escapeHtml(cust.so_dien_thoai)}</code>
          </td>
          <td>
            <span style="font-size: 13px; color: var(--text);">${escapeHtml(emailText)}</span>
          </td>
          <td>
            ${projBadge}
          </td>
          <td style="text-align: center; font-weight: 700; color: var(--blue);">
            ${bookingsCount}
          </td>
          <td>
            <div class="action-row" style="justify-content: flex-end;">
              <button class="btn sm" type="button" data-action="edit" data-id="${cust.ma_khach_hang}">Sửa</button>
              <button class="btn sm danger" type="button" data-action="delete" data-id="${cust.ma_khach_hang}">Xóa</button>
            </div>
          </td>
        </tr>
      `;
    });

    customerTableBody.innerHTML = html;
  }

  // --- ACTIONS & CRUD EVENT HANDLERS ---

  // Handle Edit and Delete actions via delegation
  customerTableBody.addEventListener("click", function (e) {
    const target = e.target;
    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");

    if (!action || !id) return;

    let list = getCustomers();
    const index = list.findIndex(c => c.ma_khach_hang === id);
    if (index === -1) return;

    if (action === "edit") {
      const cust = list[index];
      // Load form with current data
      customerIdInput.value = cust.ma_khach_hang;
      customerNameInput.value = cust.ho_va_ten;
      customerPhoneInput.value = cust.so_dien_thoai;
      customerEmailInput.value = cust.email || "";
      customerProjectLinkSelect.value = cust.du_an_lien_ket || "none";
      customerBookingsInput.value = cust.so_lan_dat_lich !== undefined ? cust.so_lan_dat_lich : 1;

      // Switch form layout states
      formTitle.textContent = "Chỉnh sửa khách hàng";
      formKicker.textContent = "Cập nhật CSDL";
      btnSubmitCustomer.textContent = "Cập nhật thay đổi";
      btnCancelEdit.style.display = "inline-block";

      // Scroll form panel smoothly into view
      document.getElementById("customerFormPanel").scrollIntoView({ behavior: "smooth" });
      customerNameInput.focus();
    } 
    else if (action === "delete") {
      const cust = list[index];
      if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${cust.ho_va_ten}" khỏi hệ thống?`)) {
        list.splice(index, 1);
        saveCustomers(list);
        
        // If we are currently editing the deleted customer, reset the form.
        if (customerIdInput.value === id) {
          resetForm();
        }

        showModal(
          "Đã xóa thành công",
          "Xóa khách hàng",
          "Xóa khách hàng khỏi database",
          `Khách hàng ${cust.ho_va_ten} đã được gỡ bỏ khỏi hệ thống.`
        );
      }
    }
  });

  // Handle Form submit (Create or Update)
  customerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = customerIdInput.value;
    const name = customerNameInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    const email = customerEmailInput.value.trim();
    const projectLink = customerProjectLinkSelect.value;
    const bookings = parseInt(customerBookingsInput.value, 10) || 0;

    if (!name || !phone || !email) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email.");
      return;
    }

    let list = getCustomers();

    if (id) {
      // --- UPDATE EXISTING CLIENT ---
      const index = list.findIndex(c => c.ma_khach_hang === id);
      if (index === -1) return;

      // Check if phone number is duplicated with another user
      const duplicatePhone = list.some(c => c.so_dien_thoai === phone && c.ma_khach_hang !== id);
      if (duplicatePhone) {
        alert("Số điện thoại này đã được sử dụng bởi khách hàng khác. Vui lòng nhập số khác.");
        return;
      }

      list[index].ho_va_ten = name;
      list[index].so_dien_thoai = phone;
      list[index].email = email;
      list[index].du_an_lien_ket = projectLink;
      list[index].so_lan_dat_lich = bookings;

      saveCustomers(list);
      resetForm();

      showModal(
        "Cập nhật thành công",
        "Thay đổi dữ liệu",
        "Cập nhật thông tin khách hàng",
        `Dữ liệu của khách hàng "${name}" đã được đồng bộ hóa thành công.`
      );
    } else {
      // --- CREATE NEW CLIENT ---
      // Check if phone number exists in DB
      const exists = list.some(c => c.so_dien_thoai === phone);
      if (exists) {
        alert("Số điện thoại này đã tồn tại trong danh sách khách hàng. Bạn có thể sử dụng chức năng Sửa.");
        return;
      }

      const newCust = {
        ma_khach_hang: generateUUID(),
        ho_va_ten: name,
        so_dien_thoai: phone,
        email: email,
        du_an_lien_ket: projectLink,
        so_lan_dat_lich: bookings,
        ngay_tao: new Date().toISOString()
      };

      list.push(newCust);
      saveCustomers(list);
      resetForm();

      showModal(
        "Tạo khách hàng thành công",
        "Khởi tạo thông tin",
        "Thêm khách hàng mới",
        `Khách hàng "${name}" với SĐT "${phone}" đã được lưu thành công vào CSDL.`
      );
    }
  });

  // Cancel edit mode
  btnCancelEdit.addEventListener("click", resetForm);

  // Focus on form input when clicking + Add customer in header
  btnFocusForm.addEventListener("click", function() {
    resetForm();
    document.getElementById("customerFormPanel").scrollIntoView({ behavior: "smooth" });
    customerNameInput.focus();
  });

  // Reset database back to default seed data
  btnResetMockDb.addEventListener("click", function () {
    if (confirm("Bạn có muốn xóa toàn bộ thay đổi và đặt lại dữ liệu gốc?")) {
      localStorage.removeItem("noofoto_customers");
      const list = getCustomers();
      saveCustomers(list);
      resetForm();
      showModal("Đặt lại dữ liệu", "Hệ thống khôi phục", "Khôi phục dữ liệu ban đầu", "Toàn bộ cơ sở dữ liệu khách hàng giả lập đã được khôi phục về trạng thái ban đầu.");
    }
  });

  // Search input change handler
  customerSearchInput.addEventListener("input", renderTable);

  // Filters select change handlers
  filterProject.addEventListener("change", renderTable);
  sortField.addEventListener("change", renderTable);

  // --- MODAL UTILS ---
  function showModal(kicker, title, heading, text) {
    modalKicker.textContent = kicker;
    modalTitle.textContent = title;
    modalContentHeading.textContent = heading;
    modalContentText.textContent = text;
    messageModal.classList.add("show");
  }

  function hideModal() {
    messageModal.classList.remove("show");
  }

  closeModal.addEventListener("click", hideModal);
  btnModalOk.addEventListener("click", hideModal);
  messageModal.addEventListener("click", function (e) {
    if (e.target === messageModal) {
      hideModal();
    }
  });

  // --- HELPERS ---
  function resetForm() {
    customerForm.reset();
    customerIdInput.value = "";
    customerProjectLinkSelect.value = "none";
    customerBookingsInput.value = "1";
    formTitle.textContent = "Tạo khách hàng mới";
    formKicker.textContent = "Lưu trữ thông tin";
    btnSubmitCustomer.textContent = "Lưu thông tin khách hàng";
    btnCancelEdit.style.display = "none";
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- INITIAL STARTUP ---
  updateStats();
  renderTable();
});
