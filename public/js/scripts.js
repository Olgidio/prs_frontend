const BACKEND_URL = 'https://api.prs-api.xyz';

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
    'Content-Type': 'application/json'
  };
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

async function loadPublicDashboard() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/vaccinations/summary/public`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    const doses = data.map(v => v.dose_number);
    const types = data.map(v => v.vaccine_name);
    const dates = data.map(v => new Date(v.date_administered).toLocaleDateString());

    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const uniqueTypes = Object.keys(typeCounts);
    const counts = Object.values(typeCounts);

    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: types,
        datasets: [{
          label: 'Dose Number',
          data: doses,
          backgroundColor: '#00b1a2'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: uniqueTypes,
        datasets: [{ data: counts, backgroundColor: ['#2d4257', '#00b1a2', '#ffce56'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Vaccination Timeline',
          data: doses,
          borderColor: '#2d4257',
          fill: false,
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

  } catch (error) {
    console.error("Error loading dashboard:", error);
    document.querySelector('.dashboard-container')?.insertAdjacentHTML("beforeend",
      `<p style="color:red">Error loading vaccination data. Please try again later.</p>`);
  }
}

async function loadMerchantDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/inventory/summary`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  const labels = data.map(i => `${i.item_type} - ${i.item_subtype}`);
  const quantities = data.map(i => i.quantity);

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: 'Quantity in Stock', data: quantities }]
    }
  });
}

async function loadGovDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/gov/dashboard-summary`, {
    headers: getAuthHeaders()
  });
  const stats = await res.json();

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: stats.labels,
      datasets: [{ label: 'Total Vaccinations', data: stats.vaccinations }]
    }
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: stats.vaccineTypes,
      datasets: [{ data: stats.vaccineCounts }]
    }
  });

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: stats.months,
      datasets: [{ label: 'Monthly Trends', data: stats.trend }]
    }
  });
}

async function loadAuditLogs() {
  const res = await fetch(`${BACKEND_URL}/api/audit/logs`, {
    headers: getAuthHeaders()
  });
  const logs = await res.json();
  const tableBody = document.getElementById("reportTableBody");
  tableBody.innerHTML = '';

  logs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.user_email}</td>
      <td>${log.role}</td>
      <td>${log.action}</td>
      <td>${new Date(log.timestamp).toLocaleString()}</td>`;
    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const protectedPages = ["upload-vaccine.html"];
  const currentPage = window.location.pathname.split("/").pop();
  const token = localStorage.getItem("token");

  if (protectedPages.includes(currentPage) && !token) {
    alert("You must be logged in to upload vaccination records.");
    window.location.href = "login.html";
    return;
  }

  if (document.title.toLowerCase().includes("public dashboard")) loadPublicDashboard();
  if (document.title.toLowerCase().includes("merchant dashboard")) loadMerchantDashboard();
  if (document.title.toLowerCase().includes("government dashboard")) loadGovDashboard();
  if (document.title.toLowerCase().includes("admin reports")) loadAuditLogs();

  if (document.getElementById("navbar")) loadPartial("navbar", "components/navbar.html");
  if (document.getElementById("footer")) loadPartial("footer", "components/footer.html");

  const logoutBtn = document.getElementById("logoutBtn");
  const navbarLogout = document.getElementById("navbarLogout");

  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
  if (navbarLogout) navbarLogout.addEventListener("click", logoutUser);

  const authBtn = document.getElementById("authBtn");
  if (authBtn) {
    if (token) {
      authBtn.textContent = "Logout";
      authBtn.onclick = logoutUser;
    } else {
      authBtn.textContent = "Login";
      authBtn.onclick = () => window.location.href = "login.html";
    }
  }
});

function loadPartial(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => document.getElementById(id).innerHTML = html);
}

const fileInput = document.getElementById("vaccineFile");
const uploadBtn = document.getElementById("uploadVaccineBtn");
const messageBox = document.getElementById("uploadMessage");

if (fileInput && uploadBtn && messageBox) {
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      messageBox.textContent = "Please select a file first.";
      return;
    }
    if (file.type !== "application/json") {
      messageBox.textContent = "Invalid file type. Only .json files are allowed.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const content = JSON.parse(reader.result);
        const res = await fetch(`${BACKEND_URL}/api/vaccinations/upload`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(content)
        });
        if (!res.ok) throw new Error("Upload failed");
        messageBox.textContent = "Vaccination record uploaded successfully!";
        messageBox.style.color = "green";
        fileInput.value = "";
      } catch (err) {
        messageBox.textContent = "Upload failed: " + err.message;
        messageBox.style.color = "red";
      }
    };
    reader.readAsText(file);
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const first_name = document.getElementById("first_name").value.trim();
    const middle_name = document.getElementById("middle_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const mobile_phone = document.getElementById("mobile_phone").value.trim();
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;
    const home_address = document.getElementById("home_address").value.trim();
    const desired_role = document.getElementById("desired_role").value;

    if (password !== confirm_password) {
      alert("Passwords do not match.");
      return;
    }

    if (!desired_role) {
      alert("Please select a role.");
      return;
    }

    const body = {
      first_name,
      middle_name,
      last_name,
      email,
      password,
      mobile_phone,
      home_address,
      desired_role,
      vat_number: "",   // Optional for merchants
      store_name: "",
      address: "",
      region: "",
      gov_otp: ""       // Optional for government
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const text = await res.text();
      console.log("Registration raw response:", text);
      const data = JSON.parse(text);

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "login.html";
      } else {
        alert(data.error || "Registration failed.");
      }

    } catch (err) {
      alert("Server error. Please try again later.");
      console.error("Registration crash:", err);
    }
  });
}
