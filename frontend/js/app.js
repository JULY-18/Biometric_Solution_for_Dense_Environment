document.addEventListener("DOMContentLoaded", () => {
  // Views
  const splashView = document.getElementById("splash-view");
  const authView = document.getElementById("auth-view");
  const teacherView = document.getElementById("teacher-view");
  const studentView = document.getElementById("student-view");

  function switchView(targetView) {
    [splashView, authView, teacherView, studentView].forEach(v => {
      v.classList.remove("active");
    });
    // Small delay to allow CSS opacity transition if needed
    setTimeout(() => {
      targetView.classList.add("active");
    }, 50);
  }

  // --- SPLASH LOGIC ---
  // Simulate app loading / splash screen for 2.5 seconds
  setTimeout(() => {
    switchView(authView);
  }, 2500);

  // --- AUTH LOGIC ---
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("email");
  const teacherNameSpan = document.getElementById("teacher-name");

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    // Mock Authentication Logic based on Email
    // Any email with 'faculty', 'teacher', 'prof' OR domain '@faculty.mitvpu.ac.in'
    if (email.includes("faculty") || email.includes("prof") || email.includes("teacher")) {
      teacherNameSpan.textContent = formattedName;
      switchView(teacherView);
    } else {
      switchView(studentView);
    }
  });

  // Logout Logic
  document.getElementById("btn-logout-teacher").addEventListener("click", () => {
    emailInput.value = '';
    document.getElementById("password").value = '';
    if (window.cameraManager && window.cameraManager.isActive()) {
      window.cameraManager.stop(); // stop camera on logout
    }
    switchView(authView);
  });
  
  document.getElementById("btn-logout-student").addEventListener("click", () => {
    emailInput.value = '';
    document.getElementById("password").value = '';
    // Reset booking form
    document.getElementById("booking-form-container").classList.remove("hidden");
    document.getElementById("booking-success").classList.add("hidden");
    switchView(authView);
  });

  // --- TEACHER DASHBOARD LOGIC ---
  const tabVideo = document.getElementById("tab-video");
  const tabManual = document.getElementById("tab-manual");
  const sectionVideo = document.getElementById("section-video");
  const sectionManual = document.getElementById("section-manual");

  tabVideo.addEventListener("click", () => {
    tabVideo.classList.add("active");
    tabManual.classList.remove("active");
    sectionVideo.classList.remove("hidden");
    sectionManual.classList.add("hidden");
  });

  tabManual.addEventListener("click", () => {
    tabManual.classList.add("active");
    tabVideo.classList.remove("active");
    sectionManual.classList.remove("hidden");
    sectionVideo.classList.add("hidden");
    
    // Stop camera if navigating away
    if (window.cameraManager && window.cameraManager.isActive()) {
      document.getElementById("btn-toggle-camera").click(); // simulate click to stop
    }
  });

  // --- STUDENT DASHBOARD LOGIC ---
  const bookingForm = document.getElementById("booking-form");
  const bookingFormContainer = document.getElementById("booking-form-container");
  const bookingSuccess = document.getElementById("booking-success");

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Simulate booking API call
    bookingForm.querySelector("button").textContent = "Booking...";
    setTimeout(() => {
      bookingFormContainer.classList.add("hidden");
      bookingSuccess.classList.remove("hidden");
      bookingForm.querySelector("button").textContent = "Confirm Booking";
    }, 1200);
  });
});
