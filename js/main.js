// =========================================================
// SK MAHATHI — COMMON JAVASCRIPT
// Phase 1B: Consolidated page scripts.
// Existing functionality retained.
// =========================================================

// ====== CONFIG: replace both values ======
const SCRIPT_URL = "YOUR_GOOGLE_SCRIPT_WEBAPP_URL";   // e.g. https://script.google.com/macros/s/AKfycbx.../exec
const OWNER_EMAIL = "YOUR_EMAIL_HERE";                // used by Apps Script email

// Smooth scroll for same-page anchor links
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
});

// Handle student form if present
const form = document.getElementById("studentForm");
if (form) {
  const resp = document.getElementById("responseMsg");
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    resp.textContent = "Submitting…";
    try {
      const fd = new FormData(form);
      // Add owner_email as hidden auxiliary (optional for Apps Script usage)
      fd.append("owner_email", OWNER_EMAIL);
      const r = await fetch(SCRIPT_URL, { method:"POST", body: fd });
      if (r.ok) {
        resp.textContent = "✅ Thank you! We will contact you soon.";
        form.reset();
      } else {
        resp.textContent = "⚠️ Something went wrong. Please try again.";
      }
    } catch (err) {
      resp.textContent = "⚠️ Network error, try again later.";
    }
  });
}

// =========================================================
// CONCERT TABLE SORTING
// =========================================================

if (document.getElementById("concertTable")) {
// Sorting Functionality
  document.querySelectorAll("#concertTable th").forEach((header, index) => {
    header.addEventListener("click", () => {
      const table = header.closest("table");
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const isAsc = header.classList.contains("sorted-asc");

      // Remove sort classes from all headers
      table.querySelectorAll("th").forEach(th => th.classList.remove("sorted-asc", "sorted-desc"));

      header.classList.toggle("sorted-asc", !isAsc);
      header.classList.toggle("sorted-desc", isAsc);

      rows.sort((a, b) => {
        let cellA = a.children[index].innerText.trim();
        let cellB = b.children[index].innerText.trim();

        // Date handling
        if (index === 0) {
          const [dA, mA, yA] = cellA.split("-").map(Number);
          const [dB, mB, yB] = cellB.split("-").map(Number);
          return isAsc
            ? new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA)
            : new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
        }

        return isAsc ? cellB.localeCompare(cellA) : cellA.localeCompare(cellB);
      });

      rows.forEach(row => tbody.appendChild(row));
    });
  });
}


// =========================================================
// CONCERT BOOKING ENQUIRY
// =========================================================

if (document.getElementById("concertForm")) {
/* ----- Config ----- */
const appsScriptURL = "https://script.google.com/macros/s/AKfycbz-rPRjLFzetFLMML-yCOJqv8-fVpwuqCw0KY1Orf0PwmoKJDypKqopmCx4EGLAcI_7bw/exec";
const concertForm = document.getElementById("concertForm");
const form = concertForm;
const submitBtn = form.querySelector('button[type="submit"]');
const stateSelect = document.getElementById("state");
const countryWrapper = document.getElementById("countryWrapper");
const countryInput = document.getElementById("country");

/* ----- Helpers ----- */
function setError(field, message) {
  field.classList.add("error");
  let err = field.nextElementSibling;
  if (!err || !err.classList.contains("error-message")) {
    err = document.createElement("div");
    err.className = "error-message";
    field.insertAdjacentElement("afterend", err);
  }
  err.innerText = message;
  err.style.display = "block";
}

function clearAllErrors() {
  form.querySelectorAll(".error-message").forEach(el => el.style.display = "none");
  form.querySelectorAll(".error").forEach(f => f.classList.remove("error"));
}

function showFormMessage(type, text) {
  // type: "success" or "error"
  let existing = document.querySelector(".submission-message");
  if (existing) existing.remove();
  const div = document.createElement("div");
  div.className = "submission-message " + type;
  div.innerText = text;
  form.insertAdjacentElement("beforebegin", div);
  // auto-hide success after 6s
  if (type === "success") setTimeout(()=> div.remove(), 6000);
}

/* ----- Validation functions ----- */
function validateName(name) {
  // Allowed: letters, dot, spaces. Minimum 3 alphabetic letters.
  if (!name) return false;
  if (!/^[A-Za-z.\s]+$/.test(name)) return false;
  const alphaCount = (name.match(/[A-Za-z]/g) || []).length;
  return alphaCount >= 3;
}

function validateEmail(email) {
  // simple but reliable check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10,15}$/.test(phone);
}

function validateFutureDate(dateValue) {
  if (!dateValue) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  const sel = new Date(dateValue);
  return sel > today; // strictly future
}

/* ----- Show/hide country logic (as before) ----- */
stateSelect.addEventListener("change", function () {
  if (this.value === "Outside India") {
    countryWrapper.style.display = "block";
    countryInput.setAttribute("required", "required");
  } else {
    countryWrapper.style.display = "none";
    countryInput.removeAttribute("required");
    countryInput.value = "";
    // clear country error if any
    const err = countryInput.nextElementSibling;
    if (err && err.classList.contains('error-message')) err.style.display = 'none';
    countryInput.classList.remove('error');
  }
});

/* ----- MAIN submit handler ----- */
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearAllErrors();
  showFormMessage("",""); // remove previous

  // Basic field references
  const nameField = form.querySelector('#name');
  const emailField = form.querySelector('#email');
  const phoneField = form.querySelector('#phone');
  const orgField = form.querySelector('#Organization');
  const venueField = form.querySelector('#venue');
  const stateField = form.querySelector('#state');
  const dateField = form.querySelector('#date');
  const typeField = form.querySelector('#concert_type');
  const durationField = form.querySelector('#duration');
  const messageField = form.querySelector('#message');

  let hasError = false;

  // Name
  const nameVal = nameField.value.trim();
  if (!validateName(nameVal)) {
    setError(nameField, "Name: only letters, space, & '.' allowed.At least 3 letters should be there.");
    hasError = true;
  }

  // Email
  const emailVal = emailField.value.trim();
  if (!validateEmail(emailVal)) {
    setError(emailField, "Please enter a valid email address.");
    hasError = true;
  }

  // Phone
  const phoneVal = phoneField.value.trim();
  if (!validatePhone(phoneVal)) {
    setError(phoneField, "Phone must be digits only (10–15 digits).");
    hasError = true;
  }

  // Organization (required)
  if (!orgField.value.trim()) {
    setError(orgField, "Organization is required.");
    hasError = true;
  }

  // Venue (required)
  if (!venueField.value.trim()) {
    setError(venueField, "City / Venue is required.");
    hasError = true;
  }

  // State required
  if (!stateField.value.trim()) {
    setError(stateField, "Please select state.");
    hasError = true;
  }

  // Country if visible
  if (countryWrapper.style.display === "block" && !countryInput.value.trim()) {
    setError(countryInput, "Country is required when 'Outside India' is selected.");
    hasError = true;
  }

  // Proposed date - required + future only
  if (!dateField.value.trim()) {
    setError(dateField, "Please enter proposed date.");
    hasError = true;
  } else if (!validateFutureDate(dateField.value.trim())) {
    setError(dateField, "Please choose a future date (after today).");
    hasError = true;
  }

  // Concert type & duration
  if (!typeField.value.trim()) {
    setError(typeField, "Please choose concert type.");
    hasError = true;
  }
  if (!durationField.value.trim()) {
    setError(durationField, "Please choose approximate duration.");
    hasError = true;
  }

  // Message (required)
  if (!messageField.value.trim()) {
    setError(messageField, "Please enter additional details and any other proposed dates.");
    hasError = true;
  }

  if (hasError) {
    // scroll to first error
    const firstErr = form.querySelector(".error");
    if (firstErr) firstErr.scrollIntoView({behavior:"smooth", block:"center"});
    return;
  }

  // disable submit to avoid double submits
  submitBtn.disabled = true;

  // prepare FormData and trimmed values
  const formData = new FormData(form);
  // ensure trimmed values are used:
  formData.set("name", nameVal);
  formData.set("email", emailVal);
  formData.set("phone", phoneVal);
  formData.set("Organization", orgField.value.trim());
  formData.set("venue", venueField.value.trim());
  formData.set("state", stateField.value.trim());
  formData.set("country", countryInput.value.trim());
  formData.set("date", dateField.value.trim());
  formData.set("concert_type", typeField.value.trim());
  formData.set("duration", durationField.value.trim());
  formData.set("message", messageField.value.trim());

  try {
    // 1) Submit to Formspree (email) and check response
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      // try parse JSON error message
      let errText = "Error submitting form. Please try again later.";
      try {
        const json = await response.json();
        if (json && json.error) errText = json.error;
        if (json && json.message) errText = json.message;
      } catch (_) {}
      showFormMessage("error", errText);
      submitBtn.disabled = false;
      return;
    }

    // 2) Submit to Apps Script (Google Sheet)
    const appsBody = new URLSearchParams({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      Organization: formData.get("Organization"),
      venue: formData.get("venue"),
      state: formData.get("state"),
      country: formData.get("country"),
      date: formData.get("date"),
      concert_type: formData.get("concert_type"),
      duration: formData.get("duration"),
      message: formData.get("message")
    });

    // don't rely on response from Apps Script (no-cors sometimes), but await it
    await fetch(appsScriptURL, { method: "POST", body: appsBody });

    // success
    showFormMessage("success", "✅ Thank you — your enquiry has been submitted. We will contact you soon.");
    form.reset();
    countryWrapper.style.display = "none";

  } catch (err) {
    console.error(err);
    showFormMessage("error", "Submission failed — please try again or email skmahathi@gmail.com");
  } finally {
    submitBtn.disabled = false;
  }
});
}


// =========================================================
// ENROLLMENT NOTIFICATION
// =========================================================

if (document.getElementById("notifyForm")) {
document.getElementById("notifyForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailField = document.getElementById("email");
  const email = emailField.value.trim();

  // ✅ Stricter email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    alert("⚠️ Please enter a valid email address before submitting.");
    emailField.focus();
    return;
  }

  const formData = new FormData(this);

  try {
    const response = await fetch(this.action, {
      method: "POST",
      body: new URLSearchParams(formData),
      mode: "no-cors" // ✅ Needed for Google Forms
    });

    // ✅ Assume success if no network error
    alert("✅ Thank you! You’ll be notified when enrollment opens.");
    this.reset();
  } catch (err) {
    alert("❌ There was an error submitting your request. Please try again later.");
    console.error("Notify form error:", err);
  }
});
}
