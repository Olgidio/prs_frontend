const BACKEND_URL = 'https://api.prs-api.xyz';
const USE_MOCK_DATA = true;

async function mockFetch(endpoint) {
  const mapping = {
    '/api/audit/logs': '/mock/audit_logs.json',
    '/api/inventory/summary': '/mock/inventory.json',
    '/api/gov/dashboard-summary': '/mock/orders.json',
    '/api/items': '/mock/items.json',
    '/api/locations': '/mock/locations.json',
    '/api/merchants': '/mock/merchants.json',
    '/api/officials': '/mock/officials.json',
    '/api/orders': '/mock/orders.json',
    '/api/order-items': '/mock/order_items.json',
    '/api/vaccinations/summary/public': '/mock/vaccinations_public.json',
  };

  const file = mapping[endpoint];
  if (!file) throw new Error("No mock mapping for endpoint: " + endpoint);

  const res = await fetch(file);
  return res.json();
}

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

function redirectToDashboard(role) {
  switch (role) {
    case "Public":
      window.location.href = "public-dashboard.html";
      break;
    case "Merchant":
      window.location.href = "merchant-dashboard.html";
      break;
    case "Government Official":
      window.location.href = "gov-dashboard.html";
      break;
    default:
      window.location.href = "login.html";
  }
}

async function loadPublicDashboard() {
  try {
    const data = USE_MOCK_DATA
      ? await mockFetch('/api/vaccinations/summary/public')
      : await (await fetch(`${BACKEND_URL}/api/vaccinations/summary/public`, { headers: getAuthHeaders() })).json();

    // The rest remains as you have it:
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
  try {
    const data = USE_MOCK_DATA
      ? await mockFetch('/api/inventory/summary')
      : await (await fetch(`${BACKEND_URL}/api/inventory/summary`, { headers: getAuthHeaders() })).json();

    const labels = data.map(i => `${i.item_type} - ${i.item_subtype}`);
    const quantities = data.map(i => i.quantity);

    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Quantity in Stock', data: quantities }]
      }
    });
  } catch (error) {
    console.error("Error loading merchant dashboard:", error);
  }
}

async function loadGovDashboard() {
  try {
    const stats = USE_MOCK_DATA
      ? await mockFetch('/api/gov/dashboard-summary')
      : await (await fetch(`${BACKEND_URL}/api/gov/dashboard-summary`, { headers: getAuthHeaders() })).json();

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
  } catch (error) {
    console.error("Error loading government dashboard:", error);
  }
}

async function loadAuditLogs() {
  try {
    const logs = USE_MOCK_DATA
      ? await mockFetch('/api/audit/logs')
      : await (await fetch(`${BACKEND_URL}/api/audit/logs`, { headers: getAuthHeaders() })).json();

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
  } catch (error) {
    console.error("Error loading audit logs:", error);
  }
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

  if (document.title.toLowerCase().includes("public dashboard") && !currentPage.includes("upload")) {
    loadPublicDashboard();
  }
  if (document.title.toLowerCase().includes("merchant dashboard") && !currentPage.includes("upload")) {
    loadMerchantDashboard();
  }
  if (document.title.toLowerCase().includes("government dashboard") && !currentPage.includes("upload")) {
    loadGovDashboard();
  }
  if (document.title.toLowerCase().includes("admin reports")) loadAuditLogs();

  if (document.getElementById("navbar")) loadPartial("navbar", "components/navbar.html");
  if (document.getElementById("footer")) loadPartial("footer", "components/footer.html");

  if (currentPage === "user-profile.html") {
    const role = localStorage.getItem("role");
    redirectToDashboard(role);
  }

  const uploadVaccineBtn = document.getElementById("uploadVaccineBtn");
  if (uploadVaccineBtn) {
    uploadVaccineBtn.addEventListener("click", handleVaccineUpload);
  }

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

async function handleVaccineUpload() {
  const fileInput = document.getElementById("vaccineFile");
  const messageDiv = document.getElementById("uploadMessage");
  
  if (!fileInput.files || fileInput.files.length === 0) {
    messageDiv.innerHTML = '<p style="color: red;">Please select a JSON file to upload.</p>';
    return;
  }

  const file = fileInput.files[0];
  
  if (!file.name.toLowerCase().endsWith('.json')) {
    messageDiv.innerHTML = '<p style="color: red;">Please select a valid JSON file.</p>';
    return;
  }

  try {
    const fileContent = await readFileAsText(file);
    
    let vaccinationData;
    try {
      vaccinationData = JSON.parse(fileContent);
    } catch (parseError) {
      messageDiv.innerHTML = '<p style="color: red;">Invalid JSON file. Please check the file format.</p>';
      return;
    }

    messageDiv.innerHTML = '<p style="color: blue;">Uploading vaccination record...</p>';

    const response = await fetch(`${BACKEND_URL}/api/vaccinations/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vaccination_json: vaccinationData
      })
    });

    const result = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = '<p style="color: green;">Vaccination record uploaded successfully!</p>';
      // Clear the file input
      fileInput.value = '';
    } else {
      messageDiv.innerHTML = `<p style="color: red;">Upload failed: ${result.message || 'Unknown error'}</p>`;
    }

  } catch (error) {
    console.error('Upload error:', error);
    messageDiv.innerHTML = '<p style="color: red;">Upload failed. Please try again.</p>';
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}
function loadPartial(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;

      // Dashboard redirection in navbar
      const dashboardBtn = document.getElementById("dashboardRedirect");
      if (dashboardBtn) {
        dashboardBtn.addEventListener("click", () => {
          const role = localStorage.getItem("role");
          redirectToDashboard(role);
        });
      }

      const logoutBtn = document.getElementById("logoutBtn");
      const navbarLogout = document.getElementById("navbarLogout");
      if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
      if (navbarLogout) navbarLogout.addEventListener("click", logoutUser);
    });
}
  
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch('https://api.prs-api.xyz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      if (response.ok && data.body && data.body.token && data.body.role) {
        localStorage.setItem('token', data.body.token);
        localStorage.setItem('role', data.body.role);
        
        redirectToDashboard(data.body.role);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
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
      vat_number: "",   
      store_name: "",
      address: "",
      region: "",
      gov_otp: ""      
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

async function prefillProfileForm() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/profile`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const user = data.body;

    document.getElementById("first_name").value = user.first_name || "";
    document.getElementById("middle_name").value = user.middle_name || "";
    document.getElementById("last_name").value = user.last_name || "";
    document.getElementById("mobile_phone").value = user.mobile_phone || "";
    document.getElementById("home_phone").value = user.home_phone || "";
    document.getElementById("work_phone").value = user.work_phone || "";
    document.getElementById("home_address").value = user.home_address || "";
  } catch (err) {
    console.error("Failed to prefill profile:", err);
  }
}

async function handleProfileFormSubmit(e) {
  e.preventDefault();
  const messageDiv = document.getElementById("profileMessage");
  const body = {
    first_name: document.getElementById("first_name").value,
    middle_name: document.getElementById("middle_name").value,
    last_name: document.getElementById("last_name").value,
    mobile_phone: document.getElementById("mobile_phone").value,
    home_phone: document.getElementById("home_phone").value,
    work_phone: document.getElementById("work_phone").value,
    home_address: document.getElementById("home_address").value
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/profile/update`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (res.ok) {
      messageDiv.innerHTML = '<p style="color: green;">Profile updated successfully!</p>';
    } else {
      messageDiv.innerHTML = `<p style="color: red;">Update failed: ${result.message}</p>`;
    }
  } catch (err) {
    console.error("Profile update error:", err);
    messageDiv.innerHTML = '<p style="color: red;">Server error while updating profile.</p>';
  }
}

async function prefillIdentifiersForm() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/profile/identifiers`, { headers: getAuthHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    const id = data.body;

    document.getElementById("dob").value = id.dob || "";
    document.getElementById("passport_num").value = id.passport_num || "";
    document.getElementById("national_insurance_number").value = id.national_insurance_number || "";
    document.getElementById("drivers_licence_number").value = id.drivers_licence_number || "";
    document.getElementById("nhs_number").value = id.nhs_number || "";
  } catch (err) {
    console.error("Failed to prefill identifiers:", err);
  }
}

async function handleIdentifiersFormSubmit(e) {
  e.preventDefault();
  const messageDiv = document.getElementById("profileMessage");
  const body = {
    dob: document.getElementById("dob").value,
    passport_num: document.getElementById("passport_num").value,
    national_insurance_number: document.getElementById("national_insurance_number").value,
    drivers_licence_number: document.getElementById("drivers_licence_number").value,
    nhs_number: document.getElementById("nhs_number").value
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/profile/identifiers`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    const result = await res.json();
    if (res.ok) {
      messageDiv.innerHTML = '<p style="color: green;">Identifiers updated successfully!</p>';
    } else {
      messageDiv.innerHTML = `<p style="color: red;">Update failed: ${result.message}</p>`;
    }
  } catch (err) {
    console.error("Identifiers update error:", err);
    messageDiv.innerHTML = '<p style="color: red;">Server error while updating identifiers.</p>';
  }
}


if (document.getElementById("profileForm")) {
  prefillProfileForm();
  prefillIdentifiersForm();
  document.getElementById("profileForm").addEventListener("submit", handleProfileFormSubmit);
  document.getElementById("identifiersForm").addEventListener("submit", handleIdentifiersFormSubmit);
}
