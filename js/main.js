
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

