import React from 'react';

export const useJsApiLoader = () => ({ isLoaded: true });

export const GoogleMap: React.FC<any> = ({ children }) => (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Mock Google Map
        {children}
    </div>
);

export const DirectionsRenderer: React.FC<any> = () => null;

// Mock google namespace if needed
if (typeof window !== 'undefined') {
    (window as any).google = {
        maps: {
            DirectionsService: class {
                route() {
                    return Promise.resolve({
                        routes: [{ legs: [{ distance: { value: 10000 }, duration: { value: 1200 } }] }]
                    });
                }
            },
            TravelMode: { DRIVING: 'DRIVING' }
        }
    };
}
