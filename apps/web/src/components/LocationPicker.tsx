'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './location-picker.module.css';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name: string;
}

interface LocationPickerProps {
  value: string;
  latitude?: number;
  longitude?: number;
  onChange: (city: string, latitude?: number, longitude?: number) => void;
}

export function LocationPicker({ value, latitude, longitude, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search query when value prop changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for cities in Spain using Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(query)}&` +
          `countrycodes=es&` +
          `addressdetails=1&` +
          `limit=5&` +
          `featuretype=city`,
        {
          headers: {
            'User-Agent': 'CyclistsSocialNetwork/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchCities(query);
    }, 300);
  };

  const handleSelectCity = (result: LocationResult) => {
    const cityName = result.name || result.display_name.split(',')[0];
    setSearchQuery(cityName);
    setShowResults(false);
    onChange(cityName, parseFloat(result.lat), parseFloat(result.lon));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;

        try {
          // Reverse geocode to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
              `format=json&` +
              `lat=${lat}&` +
              `lon=${lon}&` +
              `zoom=10&` +
              `addressdetails=1`,
            {
              headers: {
                'User-Agent': 'CyclistsSocialNetwork/1.0',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const cityName =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.municipality ||
              data.display_name.split(',')[0];

            setSearchQuery(cityName);
            onChange(cityName, lat, lon);
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Still set coordinates even if we can't get the city name
          onChange(searchQuery, lat, lon);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location. Please enter your city manually.');
        setGettingLocation(false);
      }
    );
  };

  return (
    <div className={styles.locationPicker} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder="Search for a Spanish city..."
          className={styles.input}
          required
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className={styles.locationButton}
          title="Use my current location"
        >
          {gettingLocation ? (
            <span className={styles.spinner}>⟳</span>
          ) : (
            <span className={styles.locationIcon}>📍</span>
          )}
        </button>
      </div>

      {showResults && results.length > 0 && (
        <ul className={styles.results}>
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelectCity(result)}
              className={styles.resultItem}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      {isSearching && <div className={styles.searching}>Searching...</div>}

      {latitude && longitude && (
        <div className={styles.coordinates}>
          <small>
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </small>
        </div>
      )}
    </div>
  );
}
