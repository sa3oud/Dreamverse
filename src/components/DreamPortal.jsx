import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

const DreamPortal = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [textPhase, setTextPhase] = useState(0);
  const canvasRef = useRef(null);
  const warpSpeedRef = useRef(0);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = 0;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize stars
    const initStars = () => {
      starsRef.current = Array.from({ length: 1000 }, () => ({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 2000,
        color: `hsl(${Math.random() * 60 + 220}, 100%, 70%)`, // Blue to purple range
        size: Math.random() * 2 + 1
      }));
    };

    initStars();

    // Animation function
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isStarted) {
        // Gradually increase warp speed
        warpSpeedRef.current = Math.min(warpSpeedRef.current + 0.01, 1);
      } else {
        warpSpeedRef.current = Math.max(warpSpeedRef.current - 0.01, 0);
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Update and draw stars
      starsRef.current.forEach((star, i) => {
        // Move stars closer (decrease Z)
        star.z -= (10 + warpSpeedRef.current * 30);

        // Reset star if too close
        if (star.z < 1) {
          star.z = 2000;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        // Calculate perspective
        const perspective = 300;
        const scale = perspective / (perspective + star.z);
        
        const x = centerX + star.x * scale;
        const y = centerY + star.y * scale;
        
        // Previous position for trail effect
        const prevScale = perspective / (perspective + (star.z + 20));
        const prevX = centerX + star.x * prevScale;
        const prevY = centerY + star.y * prevScale;

        // Draw star with trail
        ctx.beginPath();
        ctx.strokeStyle = star.color;
        ctx.lineWidth = star.size * scale * (1 + warpSpeedRef.current);
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Add glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 4 * scale);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, star.size * 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Warp speed effect
      if (warpSpeedRef.current > 0.5) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width);
        gradient.addColorStop(0, 'rgba(123, 31, 162, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Text phase timing
    if (isStarted) {
      const phases = [3000, 6000, 9000];
      const timeouts = phases.map((delay, index) => 
        setTimeout(() => setTextPhase(index + 1), delay)
      );
      return () => timeouts.forEach(clearTimeout);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isStarted]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onClick={() => setIsStarted(true)}
      />

      {/* Initial Dreamverse text */}
      {!isStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 text-transparent bg-clip-text animate-pulse">
              Dreamverse
            </div>
            <div className="mt-8">
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin-slow" />
            </div>
          </div>
        </div>
      )}

      {/* Sequenced text prompts with 3D effect */}
      {isStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-8 relative">
            {textPhase >= 1 && (
              <div className="text-2xl text-white opacity-0 animate-fade-in">
                What happened in your dreams?
              </div>
            )}
            {textPhase >= 2 && (
              <div className="text-3xl text-purple-300 opacity-0 animate-fade-in-delayed">
                Let's do a reconstruction...
              </div>
            )}
            {textPhase >= 3 && (
              <div className="text-4xl bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text opacity-0 animate-fade-in-more-delayed">
                Share your journey
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamPortal;
