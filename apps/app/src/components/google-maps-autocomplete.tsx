"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@v1/ui/input";
import { MapPin } from "lucide-react";

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleMapsAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address",
  className,
  disabled = false,
}: GoogleMapsAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not found. Address autocomplete will be disabled.");
      return;
    }

    // Load Google Maps script if not already loaded
    if (!window.google) {
      setIsLoading(true);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoading(false);
        initializeAutocomplete();
      };
      script.onerror = () => {
        setIsLoading(false);
        console.error("Failed to load Google Maps API");
      };
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["address_components", "formatted_address", "geometry"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.address_components) {
        console.warn("No address components found");
        return;
      }

      // Parse address components
      const addressComponents = place.address_components as AddressComponent[];
      let streetAddress = "";
      let city = "";
      let state = "";
      let zipCode = "";
      let country = "";

      for (const component of addressComponents) {
        const types = component.types;

        if (types.includes("street_number")) {
          streetAddress = component.long_name;
        } else if (types.includes("route")) {
          streetAddress += (streetAddress ? " " : "") + component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        } else if (types.includes("postal_code")) {
          zipCode = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name;
        }
      }

      // Update the input value
      onChange(place.formatted_address || value);

      // Call the callback with parsed address
      onAddressSelect({
        streetAddress,
        city,
        state,
        zipCode,
        country,
        latitude: place.geometry?.location?.lat(),
        longitude: place.geometry?.location?.lng(),
      });
    });
  };

  // Fallback to regular input if API key is not available
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter property address manually"
          className={`pl-10 ${className || ""}`}
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-amber-600">
          ⚠️ Google Maps API not configured. Please enter address manually.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoading ? "Loading..." : placeholder}
        className={`pl-10 ${className || ""}`}
        disabled={disabled || isLoading}
      />
      {isLoading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
} 