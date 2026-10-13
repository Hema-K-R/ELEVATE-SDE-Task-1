// CredVault reference-style frontend. All data is demo-only and stays in memory.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const applications = [
  { id: "APP-2026-001", name: "Aarav Kumar", email: "aarav@example.com", course: "Web Development", submitted: "2026-10-10", status: "Pending" },
  { id: "APP-2026-002", name: "Meera Sharma", email: "meera@example.com", course: "Python Programming", submitted: "2026-10-11", status: "Pending" },
  { id: "APP-2026-003", name: "Rohan Patel", email: "rohan@example.com", course: "UI/UX Design", submitted: "2026-10-12", status: "Approved" }
];
const certificates = [
  { id: "CERT-2026-001", name: "Aarav Kumar", course: "Web Development", issueDate: "2026-10-12", status: "Verified" },
  { id: "CERT-2026-002", name: "Meera Sharma", course: "Python Programming", issueDate: "2026-10-13", status: "Verified" }
];
let nextApplication = 4;
let isAdmin = false;

function showPage(name) {
  $$(".page").forEach(page => page.classList.remove("active"));
  const target = $(`#page-${name}`);
  if (target) target.classList.add("active");
  $$(".nav a").forEach(link => link.classList.toggle("active", link.dataset.page === name));
  if (name === "dashboard") renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$$("[data-page]").forEach(control => control.addEventListener("click", event => {
  event.preventDefault();
  const destination = control.dataset.page;
  if (destination === "dashboard" && !isAdmin) return showPage("admin-login");
  showPage(destination);
}));
$("#logout-nav").addEventListener("click", () => {
  isAdmin = false;
  $("#admin-nav").classList.remove("hidden");
  $("#logout-nav").classList.add("hidden");
  showPage("home");
  toast("You have been logged out.");
});

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add("hidden"), 2800);
}
function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function renderDashboard() {
  $("#application-count").textContent = applications.length;
  $("#certificate-count").textContent = certificates.length;
  $("#applications-body").innerHTML = applications.map(app => `
    <tr>
      <td class="id-text">${escapeHtml(app.id)}</td><td>${escapeHtml(app.name)}</td>
      <td>${escapeHtml(app.email)}</td><td>${escapeHtml(app.course)}</td><td>${escapeHtml(app.submitted)}</td>
      <td><span class="status ${statusClass(app.status)}">${escapeHtml(app.status)}</span></td>
      <td>${app.status === "Pending" ? `<button class="table-action approve" data-approve="${app.id}">Approve</button><button class="table-action reject" data-reject="${app.id}">Reject</button>` : `<span class="muted">Reviewed</span>`}</td>
    </tr>`).join("");
  $("#certificates-body").innerHTML = certificates.map(cert => `
    <tr>
      <td class="id-text">${escapeHtml(cert.id)}</td><td>${escapeHtml(cert.name)}</td>
      <td>${escapeHtml(cert.course)}</td><td>${escapeHtml(cert.issueDate)}</td>
      <td><span class="status ${statusClass(cert.status)}">${escapeHtml(cert.status)}</span></td>
      <td><button class="table-action reject" data-revoke="${cert.id}">Revoke</button></td>
    </tr>`).join("");
}
document.addEventListener("click", event => {
  const approveId = event.target.dataset.approve;
  const rejectId = event.target.dataset.reject;
  const revokeId = event.target.dataset.revoke;
  if (approveId) {
    const app = applications.find(item => item.id === approveId);
    if (!app) return;
    app.status = "Approved";
    const certificateId = `CERT-2026-${String(certificates.length + 1).padStart(3, "0")}`;
    certificates.push({ id: certificateId, name: app.name, course: app.course, issueDate: new Date().toISOString().slice(0, 10), status: "Verified" });
    toast(`Application approved. Certificate ${certificateId} created.`);
    renderDashboard();
  }
  if (rejectId) {
    const app = applications.find(item => item.id === rejectId);
    if (app) { app.status = "Rejected"; toast("Application rejected."); renderDashboard(); }
  }
  if (revokeId) {
    const cert = certificates.find(item => item.id === revokeId);
    if (cert) { cert.status = "Revoked"; toast(`${revokeId} has been revoked.`); renderDashboard(); }
  }
});
$$("[data-tab]").forEach(tab => tab.addEventListener("click", () => {
  $$("[data-tab]").forEach(item => item.classList.toggle("active", item === tab));
  $("#applications-table").classList.toggle("hidden", tab.dataset.tab !== "applications");
  $("#certificates-table").classList.toggle("hidden", tab.dataset.tab !== "certificates");
}));

$("#request-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const app = {
    id: `APP-2026-${String(nextApplication++).padStart(3, "0")}`,
    name: form.get("name").trim(), email: form.get("email").trim(),
    course: form.get("course").trim(), submitted: new Date().toISOString().slice(0, 10), status: "Pending"
  };
  applications.push(app);
  const result = $("#request-result");
  result.classList.remove("hidden", "error");
  result.innerHTML = `<strong>Request submitted successfully!</strong><br>Application ID: <strong>${escapeHtml(app.id)}</strong><br>Save this ID to track your application.`;
  event.currentTarget.reset();
  renderDashboard();
});

$("#track-form").addEventListener("submit", event => {
  event.preventDefault();
  const id = $("#track-id").value.trim().toUpperCase();
  const app = applications.find(item => item.id.toUpperCase() === id);
  const result = $("#track-result");
  result.classList.remove("hidden", "error");
  if (!app) {
    result.classList.add("error");
    result.innerHTML = "No application found for that ID. Try <strong>APP-2026-001</strong>.";
    return;
  }
  result.innerHTML = `<strong>Application found</strong><br>Name: ${escapeHtml(app.name)}<br>Course: ${escapeHtml(app.course)}<br>Status: <span class="status ${statusClass(app.status)}">${escapeHtml(app.status)}</span><br>Application ID: ${escapeHtml(app.id)}`;
});

$("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  const username = $("#admin-user").value.trim();
  const password = $("#admin-password").value;
  const error = $("#login-error");
  if (username === "admin" && password === "admin123") {
    isAdmin = true;
    $("#admin-nav").classList.add("hidden");
    $("#logout-nav").classList.remove("hidden");
    error.classList.add("hidden");
    event.currentTarget.reset();
    showPage("dashboard");
  } else {
    error.textContent = "Incorrect login details. Use admin / admin123 for this demo.";
    error.classList.remove("hidden");
  }
});

$("#verify-form").addEventListener("submit", event => {
  event.preventDefault();
  const id = $("#certificate-id").value.trim().toUpperCase();
  const cert = certificates.find(item => item.id.toUpperCase() === id);
  const result = $("#verify-result");
  result.classList.remove("hidden", "error");
  if (!cert) {
    result.classList.add("error");
    result.innerHTML = "Certificate not found. Please check the ID and try again.<br>Demo ID: <strong>CERT-2026-001</strong>";
    return;
  }
  if (cert.status === "Revoked") {
    result.classList.add("error");
    result.innerHTML = `<strong>Certificate revoked</strong><br>ID: ${escapeHtml(cert.id)}<br>Recipient: ${escapeHtml(cert.name)}<br>This certificate is no longer valid.`;
    return;
  }
  result.innerHTML = `<strong>✓ Certificate is authentic</strong><br>Certificate ID: ${escapeHtml(cert.id)}<br>Recipient: ${escapeHtml(cert.name)}<br>Course: ${escapeHtml(cert.course)}<br>Issue date: ${escapeHtml(cert.issueDate)}<br>Status: <span class="status verified">Verified</span>`;
});
renderDashboard();
