(function () {
  const ZOOM = 2.5;
  const DRAG_THRESHOLD = 5;

  const protectMap = (element) => {
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
    element.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });
    element.addEventListener("copy", (event) => {
      event.preventDefault();
    });
  };

  const initMapZoom = () => {
    document.querySelectorAll(".local-info-map").forEach(protectMap);

    document.querySelectorAll(".map-magnifier").forEach((container) => {
      const image = container.querySelector(".map-magnifier__image");
      const mapSrc = container.dataset.mapSrc;

      if (!image || !mapSrc) {
        return;
      }

      protectMap(container);
      image.style.backgroundImage = `url("${mapSrc}")`;

      const state = {
        zoom: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        hasDragged: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0,
      };

      const getImageRect = () => image.getBoundingClientRect();

      const clampPan = (panX, panY, width, height) => {
        const minX = width * (1 - state.zoom);
        const minY = height * (1 - state.zoom);

        return {
          panX: Math.min(0, Math.max(minX, panX)),
          panY: Math.min(0, Math.max(minY, panY)),
        };
      };

      const applyTransform = (animate) => {
        image.style.transition = animate ? "transform 0.2s ease" : "none";

        if (state.zoom === 1) {
          image.style.transform = "";
          image.style.transformOrigin = "";
          return;
        }

        image.style.transformOrigin = "0 0";
        image.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
      };

      const resetZoom = () => {
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        applyTransform(true);
        container.classList.remove("is-zoomed", "is-dragging");
      };

      const zoomAt = (x, y) => {
        const rect = getImageRect();

        state.zoom = ZOOM;
        state.panX = x * (1 - ZOOM);
        state.panY = y * (1 - ZOOM);

        const clamped = clampPan(state.panX, state.panY, rect.width, rect.height);
        state.panX = clamped.panX;
        state.panY = clamped.panY;

        applyTransform(true);
        container.classList.add("is-zoomed");
      };

      const getLocalPoint = (clientX, clientY) => {
        const rect = getImageRect();

        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
          width: rect.width,
          height: rect.height,
        };
      };

      const isInsideImage = (point) => {
        return point.x >= 0 && point.y >= 0 && point.x <= point.width && point.y <= point.height;
      };

      container.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }

        const point = getLocalPoint(event.clientX, event.clientY);

        if (!isInsideImage(point)) {
          return;
        }

        state.isDragging = true;
        state.hasDragged = false;
        state.pointerId = event.pointerId;
        state.startX = event.clientX;
        state.startY = event.clientY;
        state.startPanX = state.panX;
        state.startPanY = state.panY;

        if (container.classList.contains("is-zoomed")) {
          container.setPointerCapture(event.pointerId);
          container.classList.add("is-dragging");
          applyTransform(false);
        }
      });

      container.addEventListener("pointermove", (event) => {
        if (!state.isDragging || event.pointerId !== state.pointerId) {
          return;
        }

        const deltaX = event.clientX - state.startX;
        const deltaY = event.clientY - state.startY;

        if (!state.hasDragged && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
          return;
        }

        if (!container.classList.contains("is-zoomed")) {
          return;
        }

        state.hasDragged = true;

        const rect = getImageRect();
        const clamped = clampPan(
          state.startPanX + deltaX,
          state.startPanY + deltaY,
          rect.width,
          rect.height
        );

        state.panX = clamped.panX;
        state.panY = clamped.panY;
        applyTransform(false);
      });

      const finishPointer = (event) => {
        if (!state.isDragging || event.pointerId !== state.pointerId) {
          return;
        }

        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId);
        }

        const point = getLocalPoint(event.clientX, event.clientY);
        const shouldZoom = !container.classList.contains("is-zoomed") && !state.hasDragged && isInsideImage(point);

        state.isDragging = false;
        state.pointerId = null;
        container.classList.remove("is-dragging");

        if (shouldZoom) {
          zoomAt(point.x, point.y);
        }
      };

      container.addEventListener("pointerup", finishPointer);
      container.addEventListener("pointercancel", finishPointer);

      container.addEventListener("dblclick", (event) => {
        if (!container.classList.contains("is-zoomed")) {
          return;
        }

        event.preventDefault();
        resetZoom();
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMapZoom);
  } else {
    initMapZoom();
  }
})();
