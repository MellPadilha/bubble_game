import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import { createSketch } from './sketch';
import './App.css';

export default function App() {
  const sketchRef = useRef();
  const videoRef = useRef();
  const [showVideo, setShowVideo] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);
  const [p5Instance, setP5Instance] = useState(null);

  useEffect(() => {
    if (!showVideo && !p5Instance) {
      const myP5 = new p5(createSketch, sketchRef.current);
      setP5Instance(myP5);
    }

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [showVideo, p5Instance]);

  const handleVideoEnd = () => {
    setShowVideo(false);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoStarted(true);
    }
  };

  console.log('showVideo:', showVideo, 'videoStarted:', videoStarted);

  if (showVideo) {
    return (
      <div className="video-container">
        <video
          ref={videoRef}
          onEnded={handleVideoEnd}
          style={{
            width: '100%',
            height: '100vh',
            objectFit: 'cover'
          }}
        >
          <source src="/game_intro.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
        
        {!videoStarted && (
          <div className="play-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1001
          }}>
            <button 
              className="play-button" 
              onClick={handlePlayVideo}
              style={{
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                border: 'none',
                color: 'white',
                padding: '20px 40px',
                fontSize: '24px',
                fontWeight: 'bold',
                borderRadius: '50px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              Iniciar
            </button>
          </div>
        )}
      </div>
    );
  }

  return <div ref={sketchRef} id="sketch-container" />;
}
