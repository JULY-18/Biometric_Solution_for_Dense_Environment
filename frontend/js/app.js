document.addEventListener("DOMContentLoaded", () => {
  // Views
  const splashView = document.getElementById("splash-view");
  const authView = document.getElementById("auth-view");
  const teacherView = document.getElementById("teacher-view");
  const studentView = document.getElementById("student-view");
  const cameraView = document.getElementById("camera-view");

  function switchView(targetView) {
    [splashView, authView, teacherView, studentView, cameraView].forEach(v => {
      v.classList.remove("active");
    });
    setTimeout(() => {
      targetView.classList.add("active");
    }, 50);
  }

  // --- SPLASH LOGIC ---
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
    switchView(authView);
  });
  
  document.getElementById("btn-logout-student").addEventListener("click", () => {
    emailInput.value = '';
    document.getElementById("password").value = '';
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
  });

  // --- FULLSCREEN iOS CAMERA LOGIC ---
  const btnOpenScanner = document.getElementById("btn-open-scanner");
  const camCloseBtn = document.getElementById("cam-close");
  const videoEl = document.getElementById("video");
  
  // Camera Controls
  const camFlashBtn = document.getElementById("cam-flash");
  const iconFlashOn = document.getElementById("icon-flash-on");
  const iconFlashOff = document.getElementById("icon-flash-off");
  const camFpsBtn = document.getElementById("cam-fps");
  const camQualityBtn = document.getElementById("cam-quality");
  const camFlipBtn = document.getElementById("cam-flip");
  const camRecordBtn = document.getElementById("cam-record-btn");
  const camTimer = document.getElementById("cam-timer");

  const cameraManager = new CameraManager(videoEl);
  let isRecording = false;
  let timerInterval = null;
  let secondsRecorded = 0;

  btnOpenScanner.addEventListener("click", async () => {
    switchView(cameraView);
    await cameraManager.start();
  });

  camCloseBtn.addEventListener("click", () => {
    if (isRecording) stopRecordingFlow();
    cameraManager.stop();
    switchView(teacherView);
  });

  camFlipBtn.addEventListener("click", async () => {
    await cameraManager.switchLens();
    updateFlashIcon(false); // resets on flip
  });

  camFpsBtn.addEventListener("click", async () => {
    const newFps = cameraManager.fps === 30 ? 60 : 30;
    camFpsBtn.textContent = newFps + " FPS";
    if(newFps === 60) camFpsBtn.classList.add("active");
    else camFpsBtn.classList.remove("active");
    await cameraManager.setFPS(newFps);
  });

  camQualityBtn.addEventListener("click", async () => {
    const newQ = cameraManager.quality === "HD" ? "4K" : "HD";
    camQualityBtn.textContent = newQ;
    if(newQ === "4K") camQualityBtn.classList.add("active");
    else camQualityBtn.classList.remove("active");
    await cameraManager.setQuality(newQ);
  });

  camFlashBtn.addEventListener("click", async () => {
    const isOn = await cameraManager.toggleTorch();
    updateFlashIcon(isOn);
  });

  function updateFlashIcon(isOn) {
    if (isOn) {
      iconFlashOn.classList.remove("hidden");
      iconFlashOff.classList.add("hidden");
      camFlashBtn.style.color = "#ffcc00";
    } else {
      iconFlashOn.classList.add("hidden");
      iconFlashOff.classList.remove("hidden");
      camFlashBtn.style.color = "white";
    }
  }

  // Recording Flow
  camRecordBtn.addEventListener("click", () => {
    if (!isRecording) startRecordingFlow();
    else stopRecordingFlow();
  });

  function startRecordingFlow() {
    isRecording = true;
    camRecordBtn.classList.add("recording");
    camTimer.classList.add("active");
    
    // Start Timer
    secondsRecorded = 0;
    camTimer.textContent = "00:00";
    timerInterval = setInterval(() => {
      secondsRecorded++;
      const mins = String(Math.floor(secondsRecorded / 60)).padStart(2, '0');
      const secs = String(secondsRecorded % 60).padStart(2, '0');
      camTimer.textContent = `${mins}:${secs}`;
    }, 1000);
    
    cameraManager.startRecording((blob) => {
      console.log("Recorded video blob ready:", blob.size, "bytes");
      alert("Recording Saved! Length: " + camTimer.textContent + "\nIn production, this uploads directly to the AI backend.");
    });
  }

  function stopRecordingFlow() {
    isRecording = false;
    camRecordBtn.classList.remove("recording");
    clearInterval(timerInterval);
    setTimeout(() => { camTimer.classList.remove("active"); }, 1500); // fade out timer
    cameraManager.stopRecording();
  }

  // --- STUDENT DASHBOARD LOGIC ---
  const bookingForm = document.getElementById("booking-form");
  const bookingFormContainer = document.getElementById("booking-form-container");
  const bookingSuccess = document.getElementById("booking-success");

  if(bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      bookingForm.querySelector("button").textContent = "Booking...";
      setTimeout(() => {
        bookingFormContainer.classList.add("hidden");
        bookingSuccess.classList.remove("hidden");
        bookingForm.querySelector("button").textContent = "Confirm Booking";
      }, 1200);
    });
  }
});
