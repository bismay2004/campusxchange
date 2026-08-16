// public/js/main.js — Client-side JavaScript for CampusXchange

// ── AUTO-DISMISS FLASH ALERTS ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelectorAll(".alert.fade.show").forEach((el) => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(el);
      bsAlert.close();
    });
  }, 5000);

  // Hero staggered animation: add subtle 'pop' to CTA buttons
  document.querySelectorAll('.hero-cta .btn').forEach((btn, i) => {
    setTimeout(() => { btn.classList.add('pop-in'); }, 420 + i * 80);
  });
});

// ── IMAGE PREVIEW FOR UPLOAD FORM ─────────────────────────
const imageInput = document.getElementById("images");
const uploadZone = document.getElementById("uploadZone");
const imagePreview = document.getElementById("imagePreview");

if (imageInput) {
  imageInput.addEventListener("change", function () {
    if (!imagePreview) return;
    imagePreview.innerHTML = "";
    const files = Array.from(this.files).slice(0, 4);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "img-preview-thumb";
        img.alt = file.name;
        imagePreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

// ── DRAG AND DROP ON UPLOAD ZONE ───────────────────────────
if (uploadZone && imageInput) {
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    const dt = new DataTransfer();
    Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4)
      .forEach((f) => dt.items.add(f));
    imageInput.files = dt.files;
    imageInput.dispatchEvent(new Event("change"));
  });
  uploadZone.addEventListener("click", (e) => {
    if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT") {
      imageInput.click();
    }
  });
}

// ── CONFIRM BEFORE FORM SUBMIT (delete buttons) ────────────
// Already handled inline with onclick="return confirm(...)"
// This is the JS alternative if you prefer unobtrusive JS:
document.querySelectorAll("[data-confirm]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (!confirm(el.dataset.confirm)) e.preventDefault();
  });
});

// ── CHARACTER COUNTER FOR TEXTAREA ─────────────────────────
document.querySelectorAll("textarea[maxlength]").forEach((ta) => {
  const max = parseInt(ta.getAttribute("maxlength"));
  const counter = document.createElement("div");
  counter.className = "form-text text-end";
  counter.textContent = `0 / ${max}`;
  ta.parentNode.insertBefore(counter, ta.nextSibling);
  ta.addEventListener("input", () => {
    const len = ta.value.length;
    counter.textContent = `${len} / ${max}`;
    counter.style.color = len > max * 0.9 ? "#dc3545" : "#6c757d";
  });
});
