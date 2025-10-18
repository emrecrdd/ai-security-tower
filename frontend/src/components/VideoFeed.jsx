import React, { useState } from 'react';

const VideoFeed = ({ cameraId, cameraName, streamUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="video-feed">
      <div className="video-header">
        <h3>📹 {cameraName || `Kamera ${cameraId}`}</h3>
        <span className="camera-status {hasError ? 'error' : 'active'}">
          {hasError ? '🔴 Hata' : '🟢 Aktif'}
        </span>
      </div>

      <div className="video-container">
        {isLoading && (
          <div className="video-loading">
            <div className="loading-spinner">📹</div>
            <p>Kamera yükleniyor...</p>
          </div>
        )}

        {hasError ? (
          <div className="video-error">
            <div className="error-icon">⚠️</div>
            <p>Kamera bağlantısı kurulamadı</p>
            <small>URL: {streamUrl || 'Tanımsız'}</small>
          </div>
        ) : (
          streamUrl && (
            <img
              src={streamUrl}
              alt={`Kamera ${cameraId} görüntüsü`}
              onLoad={handleLoad}
              onError={handleError}
              className="video-stream"
            />
          )
        )}

        {!streamUrl && !hasError && (
          <div className="no-stream">
            <div className="no-stream-icon">📷</div>
            <p>Kamera akışı mevcut değil</p>
            <small>Stream URL ayarlanmamış</small>
          </div>
        )}
      </div>

      <div className="video-footer">
        <span className="camera-id">ID: {cameraId}</span>
        {streamUrl && (
          <a href={streamUrl} target="_blank" rel="noopener noreferrer" className="stream-link">
            Akışı Aç
          </a>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;