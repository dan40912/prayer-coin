"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TEXT = {
  approximateLocation: "\u5927\u81f4\u4f4d\u7f6e",
  chooseApproximateLocation: "\u9078\u53d6\u5927\u81f4\u4f4d\u7f6e",
  dragHint:
    "\u62d6\u66f3\u5730\u5716\u8abf\u6574\u4e2d\u5fc3\u9ede\u3002\u9001\u51fa\u6642\u6703\u4fdd\u5b58\u76ee\u524d\u4e2d\u5fc3\u4f4d\u7f6e\u3002",
  resetTaipei: "\u56de\u5230\u53f0\u5317",
  dragMapAria: "\u62d6\u66f3\u5730\u5716\u8abf\u6574\u5927\u81f4\u4f4d\u7f6e",
  zoomControls: "\u5730\u5716\u7e2e\u653e\u63a7\u5236",
  currentPosition: "\u76ee\u524d\u4fdd\u5b58\u4f4d\u7f6e\uff1a",
};

const APPROXIMATE_LOCATION_LABEL = TEXT.approximateLocation;
const TAIPEI_POINT = { lat: 25.033, lng: 121.5654 };
const DEFAULT_ZOOM = 11;
const MIN_ZOOM = 9;
const MAX_ZOOM = 15;
const TILE_SIZE = 256;
const VIRTUAL_MAP_WIDTH = 760;
const VIRTUAL_MAP_HEIGHT = 420;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundCoordinate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return numeric.toFixed(6);
}

function normalizePoint(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return TAIPEI_POINT;
  return {
    lat: clamp(lat, -85.0511, 85.0511),
    lng: ((lng + 540) % 360) - 180,
  };
}

function latLngToWorld(lat, lng, zoom) {
  const size = TILE_SIZE * 2 ** zoom;
  const safeLat = clamp(Number(lat), -85.0511, 85.0511);
  const sinLat = Math.sin((safeLat * Math.PI) / 180);

  return {
    x: ((Number(lng) + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * size,
    size,
  };
}

function worldToLatLng(x, y, zoom) {
  const size = TILE_SIZE * 2 ** zoom;
  const lng = (x / size) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / size;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return normalizePoint({ lat, lng });
}

function buildMapTiles(point, zoom) {
  const center = latLngToWorld(point.lat, point.lng, zoom);
  const startX = center.x - VIRTUAL_MAP_WIDTH / 2;
  const startY = center.y - VIRTUAL_MAP_HEIGHT / 2;
  const minTileX = Math.floor(startX / TILE_SIZE);
  const maxTileX = Math.floor((startX + VIRTUAL_MAP_WIDTH) / TILE_SIZE);
  const minTileY = Math.floor(startY / TILE_SIZE);
  const maxTileY = Math.floor((startY + VIRTUAL_MAP_HEIGHT) / TILE_SIZE);
  const maxTile = 2 ** zoom;
  const tiles = [];

  for (let y = minTileY; y <= maxTileY; y += 1) {
    if (y < 0 || y >= maxTile) continue;

    for (let x = minTileX; x <= maxTileX; x += 1) {
      const wrappedX = ((x % maxTile) + maxTile) % maxTile;
      tiles.push({
        key: `${zoom}-${wrappedX}-${y}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: ((x * TILE_SIZE - startX) / VIRTUAL_MAP_WIDTH) * 100,
        top: ((y * TILE_SIZE - startY) / VIRTUAL_MAP_HEIGHT) * 100,
        width: (TILE_SIZE / VIRTUAL_MAP_WIDTH) * 100,
        height: (TILE_SIZE / VIRTUAL_MAP_HEIGHT) * 100,
      });
    }
  }

  return { center, tiles };
}

function toLocationPayload(point) {
  return {
    locationKey: "",
    locationCity: APPROXIMATE_LOCATION_LABEL,
    locationCountry: "",
    locationLat: roundCoordinate(point.lat),
    locationLng: roundCoordinate(point.lng),
  };
}

export default function PrayerLocationField({ disabled = false, onChange, value }) {
  const initialPoint = normalizePoint({
    lat: value?.locationLat || TAIPEI_POINT.lat,
    lng: value?.locationLng || TAIPEI_POINT.lng,
  });
  const [point, setPoint] = useState(initialPoint);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const onChangeRef = useRef(onChange);

  const mapView = useMemo(() => buildMapTiles(point, zoom), [point, zoom]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!value?.locationLat || !value?.locationLng) return;
    setPoint(normalizePoint({ lat: value.locationLat, lng: value.locationLng }));
  }, [value?.locationLat, value?.locationLng]);

  useEffect(() => {
    onChangeRef.current(toLocationPayload(point));
  }, [point]);

  const updatePoint = (nextPoint) => {
    setPoint(normalizePoint(nextPoint));
  };

  const resetToTaipei = () => {
    setZoom(DEFAULT_ZOOM);
    updatePoint(TAIPEI_POINT);
  };

  const changeZoom = (direction) => {
    setZoom((current) => clamp(current + direction, MIN_ZOOM, MAX_ZOOM));
  };

  const handlePointerDown = (event) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      center: mapView.center,
    };
  };

  const handlePointerMove = (event) => {
    if (!isDragging || disabled || !dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - dragRef.current.startX) / rect.width) * VIRTUAL_MAP_WIDTH;
    const dy = ((event.clientY - dragRef.current.startY) / rect.height) * VIRTUAL_MAP_HEIGHT;
    updatePoint(
      worldToLatLng(dragRef.current.center.x - dx, dragRef.current.center.y - dy, zoom)
    );
  };

  const stopDragging = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  const handleWheel = (event) => {
    if (disabled) return;
    event.preventDefault();
    changeZoom(event.deltaY > 0 ? -1 : 1);
  };

  return (
    <section className="prayer-location" aria-label={TEXT.chooseApproximateLocation}>
      <div className="prayer-location__header">
        <div>
          <strong>{TEXT.approximateLocation}</strong>
          <p>{TEXT.dragHint}</p>
        </div>
        <button type="button" onClick={resetToTaipei} disabled={disabled}>
          {TEXT.resetTaipei}
        </button>
      </div>

      <div className="prayer-location__map-wrap">
        <button
          type="button"
          className={`prayer-location__map${isDragging ? " is-dragging" : ""}`}
          disabled={disabled}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onWheel={handleWheel}
          aria-label={TEXT.dragMapAria}
        >
          <span className="prayer-location__tiles" aria-hidden="true">
            {mapView.tiles.map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                draggable={false}
                style={{
                  left: `${tile.left}%`,
                  top: `${tile.top}%`,
                  width: `${tile.width}%`,
                  height: `${tile.height}%`,
                }}
              />
            ))}
          </span>
          <span className="prayer-location__pin" aria-hidden="true" />
          <span className="prayer-location__attribution" aria-hidden="true">
            OpenStreetMap
          </span>
        </button>

        <div className="prayer-location__zoom" aria-label={TEXT.zoomControls}>
          <button type="button" onClick={() => changeZoom(1)} disabled={disabled || zoom >= MAX_ZOOM}>
            +
          </button>
          <button type="button" onClick={() => changeZoom(-1)} disabled={disabled || zoom <= MIN_ZOOM}>
            -
          </button>
        </div>
      </div>

      <p className="prayer-location__helper">
        {TEXT.currentPosition}
        {roundCoordinate(point.lat)}, {roundCoordinate(point.lng)}
      </p>

      <style jsx>{`
        .prayer-location {
          display: grid;
          gap: 0.75rem;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(15, 23, 42, 0.28);
          padding: 0.85rem;
        }

        .prayer-location__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.85rem;
        }

        .prayer-location__header strong {
          color: #f8fafc;
          font-size: 1rem;
        }

        .prayer-location__header p,
        .prayer-location__helper {
          margin: 0.2rem 0 0;
          color: rgba(226, 232, 240, 0.76);
          font-size: 0.88rem;
          line-height: 1.5;
        }

        .prayer-location__header button,
        .prayer-location__zoom button {
          min-height: 40px;
          border-radius: 11px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: rgba(15, 23, 42, 0.72);
          color: #e2e8f0;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 0 0.85rem;
        }

        .prayer-location__map-wrap {
          position: relative;
        }

        .prayer-location__map {
          position: relative;
          width: 100%;
          aspect-ratio: 1.45;
          overflow: hidden;
          border: 1px solid rgba(56, 189, 248, 0.28);
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.8);
          cursor: grab;
          touch-action: none;
          padding: 0;
        }

        .prayer-location__map.is-dragging {
          cursor: grabbing;
        }

        .prayer-location__tiles {
          position: absolute;
          inset: 0;
          opacity: 0.94;
        }

        .prayer-location__tiles img {
          position: absolute;
          object-fit: cover;
          user-select: none;
          -webkit-user-drag: none;
        }

        .prayer-location__pin {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f8fafc;
          box-shadow:
            0 0 0 5px rgba(14, 165, 233, 0.35),
            0 0 28px rgba(125, 211, 252, 0.78);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .prayer-location__pin::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(248, 250, 252, 0.72);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .prayer-location__zoom {
          position: absolute;
          right: 0.6rem;
          top: 0.6rem;
          z-index: 3;
          display: grid;
          gap: 0.35rem;
        }

        .prayer-location__zoom button {
          width: 40px;
          padding: 0;
          font-size: 1.15rem;
        }

        .prayer-location__zoom button:disabled,
        .prayer-location__header button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .prayer-location__attribution {
          position: absolute;
          right: 0.45rem;
          bottom: 0.35rem;
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.62);
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.68rem;
          line-height: 1;
          padding: 0.25rem 0.42rem;
          pointer-events: none;
        }

        @media (max-width: 520px) {
          .prayer-location__header {
            flex-direction: column;
          }

          .prayer-location__header button {
            width: 100%;
          }

          .prayer-location__map {
            aspect-ratio: 1.08;
          }
        }
      `}</style>
    </section>
  );
}
