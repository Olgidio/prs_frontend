const BACKEND_URL = 'https://datadrivenassignment-production.up.railway.app/api';
const token = localStorage.getItem("token");
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
document.addEventListener("DOMContentLoaded", function () {
  console.log("Viewport width:", window.innerWidth);
  console.log("Viewport height:", window.innerHeight);

  // Role-based redirect setup (only applies on user-profile.html)
  const roleLabel = document.getElementById("roleLabel");
  const dashboardRedirect = document.getElementById("dashboardRedirect");

  if (roleLabel && dashboardRedirect) {
    const role = localStorage.getItem("role") || "public";

    if (role === "public") {
      roleLabel.textContent = "Role: Public";
      dashboardRedirect.onclick = () => window.location.href = "public-dashboard.html";
    } else if (role === "merchant") {
      roleLabel.textContent = "Role: Merchant";
      dashboardRedirect.onclick = () => window.location.href = "merchant-dashboard.html";
    } else if (role === "government") {
      roleLabel.textContent = "Role: Government";
      dashboardRedirect.onclick = () => window.location.href = "gov-dashboard.html";
    } else {
      dashboardRedirect.disabled = true;
      dashboardRedirect.textContent = "Unknown Role";
    }
  }

  // Chart rendering (only applies on index.html or chart pages)
  const barCanvas = document.getElementById("barChart");
  const pieCanvas = document.getElementById("pieChart");
  const lineCanvas = document.getElementById("lineChart");

  if (barCanvas && pieCanvas && lineCanvas) {
    const barCtx = barCanvas.getContext("2d");
    new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Alice", "Bob", "Charlie"],
        datasets: [{
          label: "Doses",
          data: [2, 1, 3],
          backgroundColor: "#00b1a2",
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const pieCtx = pieCanvas.getContext("2d");
    new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Pfizer", "Moderna", "AstraZeneca"],
        datasets: [{
          data: [10, 5, 8],
          backgroundColor: ["#2d4257", "#00b1a2", "#ffce56"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const lineCtx = lineCanvas.getContext("2d");
    new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [{
          label: "Vaccinations Over Time",
          data: [5, 10, 7, 15],
          borderColor: "#2d4257",
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  const fileInput = document.getElementById("vaccineFile");
    const uploadBtn = document.getElementById("uploadVaccineBtn");
    const messageBox = document.getElementById("uploadMessage");

    if (fileInput && uploadBtn && messageBox) {
    uploadBtn.addEventListener("click", function () {
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
        reader.onload = function () {
        try {
            const content = JSON.parse(reader.result);
            console.log("FHIR content:", content);
            messageBox.textContent = "Vaccination record uploaded successfully!";
            fileInput.value = "";
        } catch (err) {
            messageBox.textContent = "Invalid JSON format.";
        }
        };
        reader.readAsText(file);
    });
    }
    const redirectBtn = document.getElementById("uploadVaccineRedirect");
    if (redirectBtn && role === "public") {
    redirectBtn.style.display = "inline-block";
    redirectBtn.onclick = () => window.location.href = "upload-vaccine.html";
    } else if (redirectBtn) {
    redirectBtn.style.display = "none";
    }
const isPublicDashboard =
  document.title.includes("Public Dashboard") &&
  document.getElementById("barChart");

if (isPublicDashboard) {
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["1st Dose", "2nd Dose", "Booster"],
      datasets: [{
        label: "Doses",
        data: [1, 1, 0],
        backgroundColor: "#00b1a2",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Pfizer", "Moderna", "AstraZeneca"],
      datasets: [{
        data: [1, 1, 0],
        backgroundColor: ["#2d4257", "#00b1a2", "#ffce56"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: ["Jan 2023", "Jun 2023", "Dec 2023"],
      datasets: [{
        label: "Vaccination Dates",
        data: [1, 2, 2],
        borderColor: "#2d4257",
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
const isGovDashboard =
  document.title.includes("Government Dashboard") &&
  document.getElementById("barChart");

if (isGovDashboard) {
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr"],
      datasets: [{
        label: "Vaccinations (k)",
        data: [120, 150, 180, 210],
        backgroundColor: "#00b1a2",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Pfizer", "Moderna", "AstraZeneca"],
      datasets: [{
        data: [40, 35, 25],
        backgroundColor: ["#2d4257", "#00b1a2", "#ffce56"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr"],
      datasets: [{
        label: "Vaccination Trend",
        data: [120, 150, 180, 210],
        borderColor: "#2d4257",
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
const isMerchantDashboard =
  document.title.includes("Merchant Dashboard") &&
  document.getElementById("barChart");

if (isMerchantDashboard) {
  const barCtx = document.getElementById("barChart").getContext("2d");
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Masks", "Gloves", "Sanitizers", "Test Kits"],
      datasets: [{
        label: "Stock Count",
        data: [120, 95, 60, 30],
        backgroundColor: "#00b1a2",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: ["Masks", "Gloves", "Sanitizers", "Test Kits"],
      datasets: [{
        data: [30, 25, 25, 20],
        backgroundColor: ["#2d4257", "#00b1a2", "#ffce56", "#8e44ad"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: "Inventory Flow",
        data: [200, 180, 160, 140],
        borderColor: "#2d4257",
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
const isAdminReports = document.title.includes("Admin Reports");

if (isAdminReports) {
  const tableBody = document.getElementById("reportTableBody");

  const sampleLogs = [
    { user: "Alice", role: "Public", action: "Logged In", time: "2025-06-01 08:32" },
    { user: "Bob", role: "Merchant", action: "Uploaded Inventory", time: "2025-06-02 10:15" },
    { user: "Carol", role: "Government", action: "Viewed Reports", time: "2025-06-02 11:00" },
    { user: "David", role: "Merchant", action: "Downloaded Report", time: "2025-06-03 09:47" }
  ];

  sampleLogs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.user}</td>
      <td>${log.role}</td>
      <td>${log.action}</td>
      <td>${log.time}</td>
    `;
    tableBody.appendChild(row);
  });
}
const isFindItemsPage = document.title.includes("Find Critical Items");

if (isFindItemsPage) {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("itemResults");

  const sampleItems = [
    { name: "Masks", stock: 120, location: "Pharmacy A, Downtown" },
    { name: "Sanitizer", stock: 45, location: "Health Store B, North Market" },
    { name: "Gloves", stock: 200, location: "General Mart, Eastside" },
    { name: "Test Kits", stock: 30, location: "Clinic C, West District" }
  ];

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    resultsContainer.innerHTML = "";

    const filtered = sampleItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = "<p>No matching items found.</p>";
    } else {
      filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
          <h4>${item.name}</h4>
          <p><strong>Stock:</strong> ${item.stock}</p>
          <p><strong>Location:</strong> ${item.location}</p>
        `;
        resultsContainer.appendChild(card);
      });
    }
  });
}


});




function loadPartial(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => document.getElementById(id).innerHTML = html);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("navbar")) {
    loadPartial("navbar", "components/navbar.html");
  }
  if (document.getElementById("footer")) {
    loadPartial("footer", "components/footer.html");
  }
});
