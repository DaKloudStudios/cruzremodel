import React from 'react';
import { useWeather } from '../utils/weatherUtils';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
    const { forecast, loading, locationName } = useWeather();

    const getIcon = (condition: string) => {
        switch (condition) {
            case 'Sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
            case 'Cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
            case 'Rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
            case 'Thunderstorm': return <CloudLightning className="w-6 h-6 text-purple-500" />;
            case 'Partly Cloudy': return <CloudSun className="w-6 h-6 text-yellow-400" />;
            default: return <Sun className="w-6 h-6 text-yellow-500" />;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                Service Area Weather ({locationName})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {forecast.map((day, index) => {
                    // Adjust for timezone weirdness by just using UTC noon
                    const dateObj = new Date(day.date + 'T12:00:00Z');
                    const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const isHighRisk = day.rainChancePercent > 60;

                    return (
                        <div key={day.date} className={`flex flex-col items-center justify-center p-3 rounded-lg border ${isHighRisk ? 'border-red-200 bg-red-50' : 'border-gray-50 bg-gray-50'}`}>
                            <span className="text-sm font-medium text-gray-600 mb-2">{dayName}</span>
                            {getIcon(day.condition)}
                            <div className="mt-2 text-center">
                                <span className="text-base font-bold text-gray-800">{day.tempHigh}°</span>
                                <span className="text-xs text-gray-500 ml-1">{day.tempLow}°</span>
                            </div>
                            {(day.rainChancePercent > 0 || isHighRisk) && (
                                <div className={`text-xs mt-1 font-medium flex items-center gap-1 ${isHighRisk ? 'text-red-600' : 'text-blue-500'}`}>
                                    {isHighRisk && <CloudRain className="w-3 h-3" />}
                                    {day.rainChancePercent}%
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
