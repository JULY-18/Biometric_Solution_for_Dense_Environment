document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const statusDot = document.getElementById("camera-status-dot");
  const statusText = document.getElementById("camera-status-text");

  const btnToggleCamera = document.getElementById("btn-toggle-camera");
  const btnSwitchCamera = document.getElementById("btn-switch-camera");
  const btnCapture = document.getElementById("btn-capture");
  const courseCodeInput = document.getElementById("course-code");

  const metricDetected = document.getElementById("metric-detected");
  const metricRecognized = document.getElementById("metric-recognized");
  const metricUnknown = document.getElementById("metric-unknown");
  const attendeesList = document.getElementById("attendees-list");
  const loadingOverlay = document.getElementById("loading-overlay");

  const camera = new CameraManager(video, statusDot, statusText);
  const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://localhost:8000" 
    : "";

  btnToggleCamera.addEventListener("click", async () => {
    if (camera.isActive()) {
      camera.stop();
      btnToggleCamera.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Start Camera
      `;
      btnSwitchCamera.disabled = true;
      btnCapture.disabled = true;
    } else {
      const started = await camera.start();
      if (started) {
        btnToggleCamera.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
          Stop Camera
        `;
        btnSwitchCamera.disabled = false;
        btnCapture.disabled = false;
      }
    }
  });

  btnSwitchCamera.addEventListener("click", async () => {
    if (camera.isActive()) {
      await camera.switchLens();
    }
  });

  btnCapture.addEventListener("click", async () => {
    if (!camera.isActive()) return;

    // Freeze frame to canvas
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    loadingOverlay.classList.remove("hidden");
    btnCapture.disabled = true;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Failed to capture image frame from video feed.");
        loadingOverlay.classList.add("hidden");
        btnCapture.disabled = false;
        return;
      }

      const formData = new FormData();
      formData.append("image", blob, "classroom_capture.jpg");
      formData.append("course_code", courseCodeInput.value.trim() || "CSE-401");

      try {
        const response = await fetch(`${API_BASE_URL}/api/attendance/verify`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Server error while processing attendance.");
        }

        const data = await response.json();
        updateResultsView(data);
      } catch (error) {
        console.error("Attendance API Error:", error);
        alert(`Failed to verify attendance: ${error.message}\nMake sure the backend is running at ${API_BASE_URL}`);
      } finally {
        loadingOverlay.classList.add("hidden");
        btnCapture.disabled = false;
      }
    }, "image/jpeg", 0.95);
  });

  function updateResultsView(data) {
    metricDetected.textContent = data.faces_detected;
    metricRecognized.textContent = data.recognized_count;
    metricUnknown.textContent = data.unknown_count;

    if (!data.attendees || data.attendees.length === 0) {
      attendeesList.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            ${data.faces_detected > 0 
              ? `${data.faces_detected} face(s) detected, but no matching enrolled students found.` 
              : "No faces detected in the captured frame. Ensure adequate classroom lighting."}
          </td>
        </tr>
      `;
      return;
    }

    attendeesList.innerHTML = data.attendees.map(attendee => `
      <tr>
        <td><strong>${escapeHtml(attendee.srn)}</strong></td>
        <td>${escapeHtml(attendee.name)}</td>
        <td>${Math.round(attendee.confidence * 100)}%</td>
        <td><span class="status-badge">PRESENT</span></td>
        <td>${new Date(attendee.marked_at).toLocaleTimeString()}</td>
      </tr>
    `).join("");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
