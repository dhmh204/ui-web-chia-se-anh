document.addEventListener("DOMContentLoaded", function () {
  const staffForm = document.getElementById("createStaffForm");
  const staffTableBody = document.getElementById("staffTableBody");

  const staffNameInput = document.getElementById("staffName");
  const staffEmailInput = document.getElementById("staffEmail");
  const staffPhoneInput = document.getElementById("staffPhone");
  const staffRoleInput = document.getElementById("staffRole");
  const staffStatusInput = document.getElementById("staffStatus");
  const passwordModeInput = document.getElementById("passwordMode");
  const manualPasswordGroup = document.getElementById("manualPasswordGroup");
  const manualPasswordInput = document.getElementById("manualPassword");

  const accountModal = document.getElementById("accountModal");
  const closeModalBtn = document.getElementById("closeModal");
  const doneModalBtn = document.getElementById("doneModal");
  const copyAccountInfoBtn = document.getElementById("copyAccountInfo");

  const modalName = document.getElementById("modalName");
  const modalEmail = document.getElementById("modalEmail");
  const modalPassword = document.getElementById("modalPassword");

  let lastCreatedAccount = null;

  if (!staffForm) {
    console.error("Không tìm thấy form #createStaffForm");
    return;
  }

  setProcessStep(1);
  bindExistingRowActions();

  passwordModeInput.addEventListener("change", function () {
    if (passwordModeInput.value === "MANUAL") {
      manualPasswordGroup.style.display = "grid";
    } else {
      manualPasswordGroup.style.display = "none";
      manualPasswordInput.value = "";
    }
  });

  staffForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = staffNameInput.value.trim();
    const email = staffEmailInput.value.trim();
    const phone = staffPhoneInput.value.trim();
    const role = staffRoleInput.value;
    const status = staffStatusInput.value;

    if (!name || !email || !phone) {
      alert("Vui lòng nhập đầy đủ họ tên, email và số điện thoại.");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Email không hợp lệ.");
      return;
    }

    if (isEmailExisted(email)) {
      alert("Email này đã tồn tại trong danh sách nhân sự.");
      return;
    }

    let tempPassword = "";

    if (passwordModeInput.value === "MANUAL") {
      tempPassword = manualPasswordInput.value.trim();

      if (!tempPassword) {
        alert("Vui lòng nhập mật khẩu tạm.");
        return;
      }
    } else {
      tempPassword = generateTempPassword();
    }

    const newStaff = {
      name,
      email,
      phone,
      role,
      status,
      tempPassword,
      projectCount: 0,
    };

    setProcessStep(2);

    setTimeout(function () {
      setProcessStep(3);
    }, 700);

    setTimeout(function () {
      addStaffToTable(newStaff);
      lastCreatedAccount = newStaff;
      setProcessStep(4);
      showAccountModal(newStaff);
      resetForm();
    }, 1400);
  });

  function addStaffToTable(staff) {
    const tr = document.createElement("tr");

    const initials = getInitials(staff.name);
    const roleLabel = staff.role === "ADMIN" ? "ADMIN" : "THỢ ẢNH";
    const roleBadge = staff.role === "ADMIN" ? "green" : "blue";

    const statusText = getStatusText(staff.status);
    const statusBadge = getStatusBadge(staff.status);

    tr.innerHTML = `
      <td>
        <div class="staff-inline">
          <div class="avatar">${initials}</div>
          <div>
            <strong>${staff.name}</strong>
            <p>${staff.role === "ADMIN" ? "Quản trị viên" : "Thợ ảnh"}</p>
          </div>
        </div>
      </td>

      <td>${staff.email}</td>

      <td>
        <span class="badge ${roleBadge}">${roleLabel}</span>
      </td>

      <td>
        <span class="badge ${statusBadge}" data-status>${statusText}</span>
      </td>

      <td>${staff.projectCount} dự án</td>

      <td>
        <div class="action-row">
          <button class="btn sm" type="button" data-edit>Sửa</button>
          <button class="btn sm" type="button" data-resend>Gửi lại mật khẩu</button>
          <button class="btn sm danger" type="button" data-lock>Khóa</button>
        </div>
      </td>
    `;

    staffTableBody.prepend(tr);
    bindRowActions(tr, staff);
  }

  function bindExistingRowActions() {
    const rows = staffTableBody.querySelectorAll("tr");

    rows.forEach(function (row) {
      const emailCell = row.children[1];
      const nameEl = row.querySelector(".staff-inline strong");

      const staff = {
        name: nameEl ? nameEl.textContent.trim() : "Nhân sự",
        email: emailCell ? emailCell.textContent.trim() : "",
        tempPassword: generateTempPassword(),
      };

      bindRowActions(row, staff);
    });
  }

  function bindRowActions(row, staff) {
    const lockBtn =
      row.querySelector("[data-lock]") ||
      Array.from(row.querySelectorAll("button")).find(function (button) {
        return (
          button.textContent.trim() === "Khóa" ||
          button.textContent.trim() === "Mở khóa"
        );
      });

    const resendBtn =
      row.querySelector("[data-resend]") ||
      Array.from(row.querySelectorAll("button")).find(function (button) {
        return button.textContent.trim() === "Gửi lại mật khẩu";
      });

    const editBtn =
      row.querySelector("[data-edit]") ||
      Array.from(row.querySelectorAll("button")).find(function (button) {
        return button.textContent.trim() === "Sửa";
      });

    const statusBadge =
      row.querySelector("[data-status]") ||
      row.children[3]?.querySelector(".badge");

    if (lockBtn && statusBadge) {
      lockBtn.addEventListener("click", function () {
        const isLocked = lockBtn.textContent.trim() === "Mở khóa";

        if (isLocked) {
          statusBadge.textContent = "Hoạt động";
          statusBadge.className = "badge green";
          lockBtn.textContent = "Khóa";
          lockBtn.classList.add("danger");
          alert(`Đã mở khóa tài khoản ${staff.email}`);
        } else {
          statusBadge.textContent = "Đã khóa";
          statusBadge.className = "badge red";
          lockBtn.textContent = "Mở khóa";
          lockBtn.classList.remove("danger");
          alert(`Đã khóa tài khoản ${staff.email}`);
        }
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        const newPassword = generateTempPassword();

        lastCreatedAccount = {
          ...staff,
          tempPassword: newPassword,
        };

        showAccountModal(lastCreatedAccount);
      });
    }

    if (editBtn) {
      editBtn.addEventListener("click", function () {
        alert("Demo: mở form sửa thông tin nhân sự.");
      });
    }
  }

  function showAccountModal(account) {
    modalName.textContent = account.name;
    modalEmail.textContent = account.email;
    modalPassword.textContent = account.tempPassword;

    accountModal.classList.add("show");
  }

  function closeAccountModal() {
    accountModal.classList.remove("show");
  }

  closeModalBtn.addEventListener("click", closeAccountModal);
  doneModalBtn.addEventListener("click", closeAccountModal);

  accountModal.addEventListener("click", function (event) {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });

  copyAccountInfoBtn.addEventListener("click", async function () {
    if (!lastCreatedAccount) {
      alert("Không có thông tin tài khoản để copy.");
      return;
    }

    const text = `
Thông tin đăng nhập Noofoto

Họ tên: ${lastCreatedAccount.name}
Email: ${lastCreatedAccount.email}
Mật khẩu tạm: ${lastCreatedAccount.tempPassword}

Vui lòng đăng nhập và đổi mật khẩu sau lần đăng nhập đầu tiên.
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      alert("Đã copy thông tin tài khoản.");
    } catch (error) {
      alert(text);
    }
  });

  function resetForm() {
    staffForm.reset();
    manualPasswordGroup.style.display = "none";
  }

  function generateTempPassword() {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";

    let password = "Nf@";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }

    return password;
  }

  function getInitials(name) {
    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    const first = words[0][0];
    const last = words[words.length - 1][0];

    return `${first}${last}`.toUpperCase();
  }

  function getStatusText(status) {
    switch (status) {
      case "HOAT_DONG":
        return "Hoạt động";
      case "CHUA_DOI_MAT_KHAU":
        return "Chờ đổi mật khẩu";
      case "DA_KHOA":
        return "Đã khóa";
      default:
        return status;
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "HOAT_DONG":
        return "green";
      case "CHUA_DOI_MAT_KHAU":
        return "yellow";
      case "DA_KHOA":
        return "red";
      default:
        return "gray";
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isEmailExisted(email) {
    const rows = staffTableBody.querySelectorAll("tr");

    for (const row of rows) {
      const cells = row.querySelectorAll("td");

      if (cells[1] && cells[1].textContent.trim() === email) {
        return true;
      }
    }

    return false;
  }

  function setProcessStep(currentStep) {
    const items = document.querySelectorAll(".process-item");

    items.forEach(function (item) {
      const itemStep = Number(item.dataset.step);

      item.classList.remove("active", "done");

      if (itemStep < currentStep) {
        item.classList.add("done");
      }

      if (itemStep === currentStep) {
        item.classList.add("active");
      }
    });
  }
});

document.querySelectorAll(".custom-select").forEach(function (select) {
  const trigger = select.querySelector(".custom-select__trigger");
  const selectedText = select.querySelector("[data-selected]");
  const hiddenInput = select.querySelector("input[type='hidden']");
  const options = select.querySelectorAll(".custom-select__menu button");

  trigger.addEventListener("click", function () {
    closeOtherSelects(select);
    select.classList.toggle("open");
  });

  options.forEach(function (option) {
    option.addEventListener("click", function () {
      const value = option.dataset.value;

      selectedText.textContent = value;
      hiddenInput.value = value;

      select.classList.remove("open");
    });
  });
});

document.addEventListener("click", function (event) {
  if (!event.target.closest(".custom-select")) {
    document.querySelectorAll(".custom-select").forEach(function (select) {
      select.classList.remove("open");
    });
  }
});

function closeOtherSelects(currentSelect) {
  document.querySelectorAll(".custom-select").forEach(function (select) {
    if (select !== currentSelect) {
      select.classList.remove("open");
    }
  });
}