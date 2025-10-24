import React, { useRef, useEffect, useState, useCallback } from 'react';

const VideoFeed = ({ cameraId, cameraName, enabled = true }) => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const animationRef = useRef(null);
  const intervalRef = useRef(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [lastCapture, setLastCapture] = useState(null);
  const [detections, setDetections] = useState([]);

  // Kamera başlatma
  useEffect(() => {
    if (!enabled) return;

    let activeStream = null;
    let mounted = true;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: 15, max: 30 } },
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStream = stream;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          if (mounted) {
            setIsActive(true);
            setIsLoading(false);
          }
        };

      } catch (err) {
        console.error('Kamera hatası:', err);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [enabled]);

  // Frame capture - ✅ BASE64'E DÖNÜŞTÜR
  const captureAndSendFrame = useCallback(async () => {
    if (!videoRef.current || !isActive || !videoRef.current.videoWidth) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      // ✅ BASE64'E ÇEVİR
      const base64Image = canvas.toDataURL('image/jpeg', 0.7);

      try {
        const response = await fetch(`${API_BASE}/ai/analyze-frame`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            frame: base64Image, // ✅ Base64 string
            cameraId: cameraId.toString()
          })
        });

        console.log('📨 Backend cevabı:', response.status);

        if (response.ok) {
          const result = await response.json();
          setLastCapture(new Date());
          setDetections(result.detections || []);
          console.log('✅ AI tespitleri:', result.detections);
        } else {
          console.error('❌ Backend hatası:', response.status);
        }
      } catch (err) {
        console.error('API hatası:', err);
      }

    } catch (error) {
      console.error('Capture hatası:', error);
    }
  }, [cameraId, isActive, API_BASE]);

  // Interval yönetimi
  useEffect(() => {
    if (!isActive) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(captureAndSendFrame, 3000);
    captureAndSendFrame();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isActive, captureAndSendFrame]);

  // Overlay çizimi (aynı kalıyor)
  useEffect(() => {
    if (!videoRef.current || !overlayRef.current) return;

    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');

    const drawOverlay = () => {
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        animationRef.current = requestAnimationFrame(drawOverlay);
        return;
      }

      // Canvas boyutlarını video ile eşle
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style.width = `${video.videoWidth}px`;
        canvas.style.height = `${video.videoHeight}px`;
      }

      // Temizle
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Tespitleri çiz
      detections.forEach(det => {
        if (!det.bbox || det.bbox.length < 4) return;

        // Eğer bbox [x1, y1, x2, y2] ise
        const [x1, y1, x2, y2] = det.bbox;
        const w = x2 - x1;
        const h = y2 - y1;

        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, w, h);

        ctx.font = '14px Arial';
        ctx.fillStyle = 'yellow';
        ctx.fillText(`${det.label} ${(det.confidence * 100).toFixed(1)}%`, x1 + 4, y1 - 6);
      });

      animationRef.current = requestAnimationFrame(drawOverlay);
    };

    animationRef.current = requestAnimationFrame(drawOverlay);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [detections]);

  return (
    <div style={{ border: '1px solid #444', borderRadius: 8, overflow: 'hidden', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: '#222', color: '#fff' }}>
        <h3 style={{ margin: 0 }}>📹 {cameraName || `Kamera ${cameraId}`}</h3>
        <span style={{ color: hasError ? 'red' : isActive ? 'lime' : 'orange', fontWeight: 'bold' }}>
          {hasError ? 'Hata' : isActive ? 'Canlı' : 'Başlatılıyor'}
        </span>
        {lastCapture && <span style={{ marginLeft: 8 }}>📸 {lastCapture.toLocaleTimeString()}</span>}
      </div>

      <div style={{ position: 'relative', width: '100%', background: '#000' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          style={{ width: '100%', display: 'block' }} 
        />
        <canvas 
          ref={overlayRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            pointerEvents: 'none' 
          }} 
        />
        {isLoading && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            color: '#fff', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            Kamera başlatılıyor...
          </div>
        )}
        {hasError && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(255,0,0,0.5)', 
            color: '#fff', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            Kamera izni reddedildi
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
