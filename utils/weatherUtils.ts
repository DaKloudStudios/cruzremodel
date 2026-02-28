import { useState, useEffect } from 'react';

export interface DailyWeather {
    date: string; // YYYY-MM-DD
    tempHigh: number;
    tempLow: number;
    condition: 'Sunny' | 'Cloudy' | 'Rain' | 'Thunderstorm' | 'Partly Cloudy';
    rainChancePercent: number;
}

const mapWmoCodeToCondition = (code: number): DailyWeather['condition'] => {
    if (code === 0 || code === 1) return 'Sunny';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Cloudy';
    if (code >= 50 && code <= 69) return 'Rain'; // Drizzle and Rain
    if (code >= 80 && code <= 82) return 'Rain'; // Rain showers
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    if (code >= 70 && code <= 79) return 'Rain'; // Snow/others mapped to rain
    return 'Cloudy'; // Default
};

let globalWeatherCache: DailyWeather[] | null = null;
let lastFetchTime = 0;
let isFetching = false;
let fetchPromise: Promise<DailyWeather[]> | null = null;

export const fetchWeatherForecast = async (lat: number = 32.7157, lon: number = -117.1611): Promise<DailyWeather[]> => {
    if (isFetching && fetchPromise) return fetchPromise;

    // Check cache (1 hour lifetime)
    if (globalWeatherCache && (Date.now() - lastFetchTime < 3600000)) {
        return globalWeatherCache;
    }

    isFetching = true;
    fetchPromise = (async () => {
        try {
            // Live Free Open-Meteo API
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data.daily) throw new Error("No daily data received");

            const forecast: DailyWeather[] = [];

            // Forecast is provided as arrays in data.daily
            for (let i = 0; i < 5; i++) {
                forecast.push({
                    date: data.daily.time[i],
                    tempHigh: Math.round(data.daily.temperature_2m_max[i]),
                    tempLow: Math.round(data.daily.temperature_2m_min[i]),
                    condition: mapWmoCodeToCondition(data.daily.weather_code[i]),
                    rainChancePercent: data.daily.precipitation_probability_max[i]
                });
            }

            globalWeatherCache = forecast;
            lastFetchTime = Date.now();
            return forecast;
        } catch (e) {
            console.error("Failed to fetch weather from Open-Meteo", e);
            return globalWeatherCache || [];
        } finally {
            isFetching = false;
        }
    })();
    return fetchPromise;
};

let globalLocationName = 'San Diego';

// React Hook to access Weather securely
export const useWeather = () => {
    const [forecast, setForecast] = useState<DailyWeather[]>(globalWeatherCache || []);
    const [loading, setLoading] = useState(!globalWeatherCache);
    const [locationName, setLocationName] = useState(globalLocationName);

    useEffect(() => {
        let mounted = true;

        const loadWeather = async (lat?: number, lon?: number) => {
            const data = await fetchWeatherForecast(lat, lon);
            if (mounted) {
                setForecast(data);
            }

            // Try reverse geocoding if lat/lon provided
            if (lat && lon) {
                try {
                    const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                    const geoData = await geoRes.json();
                    if (geoData.city) {
                        const newLoc = `${geoData.city}, ${geoData.principalSubdivision || geoData.countryCode}`;
                        globalLocationName = newLoc;
                        if (mounted) setLocationName(newLoc);
                    }
                } catch (e) {
                    console.warn("Reverse geocode failed", e);
                }
            }

            if (mounted) setLoading(false);
        };

        // Only ask for location on first load if we don't have a cache
        if (navigator.geolocation && !globalWeatherCache) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    loadWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied or failed. Defaulting to standard region.", error);
                    loadWeather(); // Defaults to San Diego fallback
                },
                { timeout: 5000 }
            );
        } else {
            loadWeather();
        }

        return () => { mounted = false; };
    }, []);

    const getWeatherWarningForDate = (dateString?: string): boolean => {
        if (!dateString || !forecast.length) return false;
        const targetDate = dateString.split('T')[0];
        const dayForecast = forecast.find(day => day.date === targetDate);
        return !!dayForecast && dayForecast.rainChancePercent > 60;
    };

    return { forecast, loading, locationName, getWeatherWarningForDate };
};
