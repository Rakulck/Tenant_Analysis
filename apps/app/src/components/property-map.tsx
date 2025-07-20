"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function PropertyMap({ latitude, longitude, address, className }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured");
      return;
    }

    const loadMap = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load Google Maps script if not already loaded
        if (!window.google) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Google Maps API"));
            document.head.appendChild(script);
          });
        }

        // Initialize map
        const position = { lat: latitude, lng: longitude };
        
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Add marker
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: address || "Property Location",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#DC2626"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 24),
          },
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Failed to load map");
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (mapInstanceRef.current) {
        // Clean up map instance
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, address]);

  if (!latitude || !longitude) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className || ""}`}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Select an address to view location</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-red-200 ${className || ""}`}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-48 rounded-lg border border-gray-200"
        style={{ minHeight: "192px" }}
      />
      {address && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <MapPin className="w-3 h-3 inline mr-1" />
          {address}
        </div>
      )}
    </div>
  );
} 