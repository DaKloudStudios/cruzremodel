import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeoLocationState {
  coords: { lat: number; lng: number; accuracy: number } | null;
  loading: boolean;
  error: string | null;
  permissionStatus: PermissionState | 'unknown';
}

export const useGeolocation = (watch: boolean = true) => {
  const [state, setState] = useState<GeoLocationState>({
    coords: null,
    loading: true,
    error: null,
    permissionStatus: 'unknown'
  });

  const watchIdRef = useRef<number | null>(null);

  // Fallback to IP-based location if HTML5 Geo fails
  const fetchIpLocation = async () => {
    try {
      const response = await fetch('https://ipinfo.io/json');
      if (!response.ok) throw new Error('IP lookup failed');
      const data = await response.json();

      if (data.loc) {
        const [latStr, lngStr] = data.loc.split(',');
        return {
          lat: parseFloat(latStr),
          lng: parseFloat(lngStr),
          accuracy: 5000 // IP location is generally inaccurate (city/zip level ~5km radius)
        };
      }
      return null;
    } catch (e) {
      console.error("IP Geolocation fallback failed:", e);
      return null;
    }
  };

  const getLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // If accuracy is terrible (e.g. > 10km), we could technically fallback here too, 
          // but for now, we trust the browser if it succeeds.
          setState({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            },
            loading: false,
            error: null,
            permissionStatus: 'granted'
          });
        },
        async (err) => {
          // Fallback on error
          console.warn("HTML5 Geo failed, trying IP fallback...", err.message);
          const ipCoords = await fetchIpLocation();

          if (ipCoords) {
            setState({
              coords: ipCoords,
              loading: false,
              error: null, // Subdued error since IP worked
              permissionStatus: err.code === err.PERMISSION_DENIED ? 'denied' : 'unknown'
            });
          } else {
            setState(prev => {
              if (prev.coords) return { ...prev, loading: false };
              return {
                ...prev,
                loading: false,
                error: 'Manual location fetch failed, and fallback was unavailable.'
              };
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // No browser support, try IP direct
      const ipCoords = await fetchIpLocation();
      if (ipCoords) {
        setState({
          coords: ipCoords,
          loading: false,
          error: null,
          permissionStatus: 'unknown'
        });
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'Geolocation is not supported.' }));
      }
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      // Initial mount fallback if completely unsupported
      fetchIpLocation().then(ipCoords => {
        if (ipCoords) {
          setState(prev => ({ ...prev, coords: ipCoords, loading: false, error: null }));
        } else {
          setState(prev => ({ ...prev, loading: false, error: 'Geolocation is not supported.' }));
        }
      });
      return;
    }

    if (watch) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      setState(prev => ({ ...prev, loading: !prev.coords }));

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            },
            loading: false,
            error: null,
            permissionStatus: 'granted'
          });
        },
        async (error) => {
          console.warn("Watch position err:", error.message);

          // Only fetch IP fallback if we don't have ANY coords yet.
          // If we have stale coords, we'll keep them rather than bouncing to a wider IP radius.
          let ipCoords = null;
          if (!state.coords) {
            ipCoords = await fetchIpLocation();
          }

          if (ipCoords) {
            setState(prev => ({
              ...prev,
              loading: false,
              coords: ipCoords, // Apply fallback
              error: null, // Suppress error UI since we have *a* location
              permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionStatus
            }));
            return;
          }

          let errorMsg = 'Unable to retrieve location. Please check your signal.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'Location permission denied. Please enable GPS in your browser settings.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'Location information is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'GPS signal timed out. Try moving outside or manually retrying.';
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: prev.coords ? null : errorMsg,
            permissionStatus: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permissionStatus
          }));
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch]); // Dependency warning: state.coords is used inside watch error handler

  return { ...state, getLocation };
};
