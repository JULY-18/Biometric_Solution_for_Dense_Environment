class CameraManager {
  constructor(videoElement, statusDot, statusText) {
    this.video = videoElement;
    this.statusDot = statusDot;
    this.statusText = statusText;
    this.stream = null;
    this.currentFacingMode = "environment"; // Default to rear lens for lecture hall scanning
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Media Capture API is not supported in this browser. Please ensure you are running on localhost or HTTPS.");
      return false;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: this.currentFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      this.stop(); // Stop previous stream if active
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;

      this.statusDot.classList.remove("dot-inactive");
      this.statusDot.classList.add("dot-active");
      this.statusText.textContent = `Live (${this.currentFacingMode === "environment" ? "Rear Lens" : "Front Lens"})`;
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      this.statusDot.classList.remove("dot-active");
      this.statusDot.classList.add("dot-inactive");
      this.statusText.textContent = "Camera Error";
      alert(`Unable to access camera: ${err.message}. Ensure browser permissions are granted.`);
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

  async switchLens() {
    this.currentFacingMode = this.currentFacingMode === "environment" ? "user" : "environment";
    return await this.start();
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }
}
