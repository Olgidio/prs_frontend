const BACKEND_URL = 'https://datadrivenassignment-production.up.railway.app/api';
const token = localStorage.getItem("token");
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Public Dashboard Data Fetcher
async function loadPublicDashboard() {
  try {
    const res = await fetch(`${BACKEND_URL}/vaccinations/summary/public`, { headers });
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
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: uniqueTypes,
        datasets: [{
          data: counts,
          backgroundColor: ['#2d4257', '#00b1a2', '#ffce56']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
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
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  } catch (error) {
    console.error("Error loading dashboard:", error);
    document.querySelector('.dashboard-container')?.insertAdjacentHTML("beforeend",
      `<p style="color:red">Error loading vaccination data. Please try again later.</p>`);
  }
}

async function loadMerchantDashboard() {
  const res = await fetch(`${BACKEND_URL}/inventory/summary`, { headers });
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
  const res = await fetch(`${BACKEND_URL}/gov/dashboard-summary`, { headers });
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
  const res = await fetch(`${BACKEND_URL}/audit/logs`, { headers });
  const logs = await res.json();

  const tableBody = document.getElementById("reportTableBody");
  tableBody.innerHTML = '';

  logs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.user_email}</td>
      <td>${log.role}</td>
      <td>${log.action}</td>
      <td>${new Date(log.timestamp).toLocaleString()}</td>
    `;
    tableBody.appendChild(row);
  });
}

const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', async () => {
    const keyword = document.getElementById('searchInput').value;
    const res = await fetch(`${BACKEND_URL}/inventory/search?query=${encodeURIComponent(keyword)}`, { headers });
    const results = await res.json();

    const resultsContainer = document.getElementById("itemResults");
    resultsContainer.innerHTML = results.map(item =>
      `<div><strong>${item.item_type} - ${item.item_subtype}</strong> (Qty: ${item.quantity})</div>`
    ).join('');
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const roleLabel = document.getElementById("roleLabel");
  const dashboardRedirect = document.getElementById("dashboardRedirect");

  if (roleLabel && dashboardRedirect) {
    const role = localStorage.getItem("role") || "public";
    roleLabel.textContent = `Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    dashboardRedirect.onclick = () => window.location.href = `${role}-dashboard.html`;
  }

  if (document.title.includes("Public Dashboard")) loadPublicDashboard();
  if (document.title.includes("Merchant Dashboard")) loadMerchantDashboard();
  if (document.title.includes("Government Dashboard")) loadGovDashboard();
  if (document.title.includes("Admin Reports")) loadAuditLogs();

  // Load navbar and footer if present
  if (document.getElementById("navbar")) loadPartial("navbar", "components/navbar.html");
  if (document.getElementById("footer")) loadPartial("footer", "components/footer.html");
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
        const res = await fetch(`${BACKEND_URL}/vaccinations/upload`, {
          method: 'POST',
          headers,
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
