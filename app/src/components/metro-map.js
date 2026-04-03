// ============================================
// Static Image Map Component
// ============================================

export function renderMetroMap(activeRoute = null) {
  // Create container
  const container = document.createElement('div');
  container.className = 'metro-map-container';
  
  // Create image wrapper for transforming
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'map-image-wrapper';
  imgWrapper.style.transformOrigin = '0 0';
  imgWrapper.style.width = '100%';
  imgWrapper.style.height = '100%';
  imgWrapper.style.display = 'flex';
  imgWrapper.style.alignItems = 'center';
  imgWrapper.style.justifyContent = 'center';

  const img = document.createElement('img');
  img.src = '/delhi-metro-map.png';
  img.alt = 'Delhi Metro Map';
  img.className = 'map-static-img';
  img.style.maxWidth = 'none'; // Allow zooming beyond container
  img.style.userSelect = 'none'; // Prevent text selection on double click
  img.draggable = false; // Prevent default image drag behavior
  
  // Give it a default large size so it's legible and zoomable
  img.style.width = '2000px'; 
  img.style.height = 'auto';

  imgWrapper.appendChild(img);
  container.appendChild(imgWrapper);

  // Implement Pan & Zoom
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let currentX = -500; // Start slightly panned
  let currentY = -500;
  let scale = 0.5; // Start zoomed out
  
  const updateTransform = () => {
    imgWrapper.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
  };

  // Initial transform
  updateTransform();

  container.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);
    
    // Calculate zoom relative to mouse position
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    currentX = mouseX - (mouseX - currentX) * zoomFactor;
    currentY = mouseY - (mouseY - currentY) * zoomFactor;
    scale *= zoomFactor;
    
    // Clamp scale
    scale = Math.min(Math.max(scale, 0.1), 5);
    updateTransform();
  });

  // Touch support for panning & basic zooming
  let initialPinchDistance = null;
  let initialScale = 1;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX - currentX;
      startY = e.touches[0].clientY - currentY;
    } else if (e.touches.length === 2) {
      isPanning = false;
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
    }
  });

  container.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent native scrolling
    if (isPanning && e.touches.length === 1) {
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      updateTransform();
    } else if (e.touches.length === 2 && initialPinchDistance) {
      const currentPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const zoomFactor = currentPinchDistance / initialPinchDistance;
      scale = Math.min(Math.max(initialScale * zoomFactor, 0.1), 5);
      updateTransform();
    }
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
    }
    if (e.touches.length === 0) {
      isPanning = false;
    }
  });

  return container;
}
