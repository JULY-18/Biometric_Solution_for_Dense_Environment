class CameraManager {
  constructor(videoElement, statusDot, statusText) {
    this.video = videoElement;
    this.statusDot = statusDot;
    this.statusText = statusText;
    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Media Capture API not supported. Use localhost or HTTPS.");
      return false;
    }

    try {
      // Request high resolution from the rear camera
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      this.statusDot.classList.remove("dot-inactive");
      this.statusDot.classList.add("dot-active");
      this.statusText.textContent = "Live (Rear Lens)";
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      this.statusDot.classList.remove("dot-active");
      this.statusDot.classList.add("dot-inactive");
      this.statusText.textContent = "Camera Error";
      alert("Unable to access camera. Check permissions.");
      return false;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.video.srcObject = null;
      this.statusDot.classList.remove("dot-active");
      this.statusDot.classList.add("dot-inactive");
      this.statusText.textContent = "Camera Idle";
    }
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }

  startRecording(onDataAvailable) {
    if (!this.isActive()) return;
    this.recordedChunks = [];
    
    // Choose the best available mime type for recording
    let options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      onDataAvailable(blob);
    };

    this.mediaRecorder.start(1000); // Collect data every second
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}

// Bind Camera UI Controls
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const statusDot = document.getElementById("camera-status-dot");
  const statusText = document.getElementById("camera-status-text");
  
  const btnToggleCamera = document.getElementById("btn-toggle-camera");
  const btnRecord = document.getElementById("btn-record");
  const recordingIndicator = document.getElementById("recording-indicator");
  
  // Attach to window so app.js can access it on logout
  window.cameraManager = new CameraManager(video, statusDot, statusText);
  let isRecording = false;

  if (btnToggleCamera) {
    btnToggleCamera.addEventListener("click", async () => {
      if (window.cameraManager.isActive()) {
        if (isRecording) stopRecordingFlow();
        window.cameraManager.stop();
        btnToggleCamera.textContent = "Start Camera";
        btnRecord.disabled = true;
      } else {
        const started = await window.cameraManager.start();
        if (started) {
          btnToggleCamera.textContent = "Stop Camera";
          btnRecord.disabled = false;
        }
      }
    });
  }

  if (btnRecord) {
    btnRecord.addEventListener("click", () => {
      if (!isRecording) {
        startRecordingFlow();
      } else {
        stopRecordingFlow();
      }
    });
  }

  function startRecordingFlow() {
    isRecording = true;
    btnRecord.textContent = "Stop & Process";
    btnRecord.style.background = "#ef4444"; // red
    recordingIndicator.classList.remove("hidden");
    
    window.cameraManager.startRecording((blob) => {
      // Simulate sending the .webm blob to the server for processing
      console.log("Recorded video blob ready for upload:", blob.size, "bytes");
      alert("HD Video Scan complete! In a real environment, this video file is now sent to the backend for frame extraction and AI processing.");
    });
  }

  function stopRecordingFlow() {
    isRecording = false;
    btnRecord.textContent = "Start HD Scan";
    btnRecord.style.background = ""; // reset
    recordingIndicator.classList.add("hidden");
    window.cameraManager.stopRecording();
  }
});
