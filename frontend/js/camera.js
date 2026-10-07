class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    
    // Default Camera Settings
    this.facingMode = "environment";
    this.fps = 30;
    this.quality = "HD"; // "HD" or "4K"
    this.torchOn = false;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Media Capture API not supported. Use localhost or HTTPS.");
      return false;
    }

    try {
      // Setup constraints based on iOS-like settings
      const width = this.quality === "4K" ? { ideal: 3840 } : { ideal: 1920 };
      const height = this.quality === "4K" ? { ideal: 2160 } : { ideal: 1080 };
      
      const constraints = {
        video: {
          facingMode: { ideal: this.facingMode },
          width: width,
          height: height,
          frameRate: { ideal: this.fps }
        },
        audio: false
      };

      this.stop(); // Stop any existing stream before applying new constraints
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera or requested quality is not supported by your device.");
      return false;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        if(track.readyState === 'live') track.stop();
      });
      this.stream = null;
      this.video.srcObject = null;
    }
  }

  isActive() {
    return this.stream !== null && this.stream.active;
  }

  async switchLens() {
    this.facingMode = this.facingMode === "environment" ? "user" : "environment";
    this.torchOn = false; // Reset torch when switching
    return await this.start();
  }
  
  async setQuality(qualityStr) {
    if (this.quality === qualityStr) return true;
    this.quality = qualityStr;
    return await this.start();
  }

  async setFPS(fpsNum) {
    if (this.fps === fpsNum) return true;
    this.fps = fpsNum;
    return await this.start();
  }

  async toggleTorch() {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    if (capabilities.torch) {
      this.torchOn = !this.torchOn;
      try {
        await track.applyConstraints({ advanced: [{ torch: this.torchOn }] });
        return this.torchOn;
      } catch (e) {
        console.error("Failed to toggle torch:", e);
        return false;
      }
    } else {
      alert("Flash/Torch is not supported on this device/camera.");
      return false;
    }
  }

  startRecording(onDataAvailable) {
    if (!this.isActive()) return;
    this.recordedChunks = [];
    
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

    this.mediaRecorder.start(1000);
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}
