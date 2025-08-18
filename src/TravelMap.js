import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default marker
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to fit map bounds to markers
const FitBounds = ({ locations }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(location => [location.lat, location.lng]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);
  
  return null;
};

const TravelMap = ({ entries, selectedEntry, onMarkerClick }) => {
  // Geocoding coordinates for major cities (simplified for demo)
  const cityCoordinates = {
    // Popular destinations
    'tokyo,japan': [35.6762, 139.6503],
    'paris,france': [48.8566, 2.3522],
    'london,england': [51.5074, -0.1278],
    'london,uk': [51.5074, -0.1278],
    'new york,usa': [40.7128, -74.0060],
    'new york,united states': [40.7128, -74.0060],
    'rome,italy': [41.9028, 12.4964],
    'barcelona,spain': [41.3851, 2.1734],
    'amsterdam,netherlands': [52.3676, 4.9041],
    'berlin,germany': [52.5200, 13.4050],
    'sydney,australia': [33.8688, 151.2093],
    'bangkok,thailand': [13.7563, 100.5018],
    'dubai,uae': [25.2048, 55.2708],
    'singapore,singapore': [1.3521, 103.8198],
    'hong kong,china': [22.3193, 114.1694],
    'los angeles,usa': [34.0522, -118.2437],
    'los angeles,united states': [34.0522, -118.2437],
    'istanbul,turkey': [41.0082, 28.9784],
    'moscow,russia': [55.7558, 37.6173],
    'cairo,egypt': [30.0444, 31.2357],
    'mumbai,india': [19.0760, 72.8777],
    'beijing,china': [39.9042, 116.4074],
    'rio de janeiro,brazil': [22.9068, -43.1729],
    'mexico city,mexico': [19.4326, -99.1332],
    'buenos aires,argentina': [-34.6118, -58.3960],
    'cape town,south africa': [-33.9249, 18.4241],
    'vancouver,canada': [49.2827, -123.1207],
    'toronto,canada': [43.6532, -79.3832],
    'montreal,canada': [45.5017, -73.5673],
    // Add more coordinates as needed
  };

  // Generate map locations with coordinates
  const mapLocations = useMemo(() => {
    return entries.map(entry => {
      const locationKey = `${entry.city.toLowerCase()},${entry.country.toLowerCase()}`;
      const coordinates = cityCoordinates[locationKey];
      
      // If we don't have coordinates, generate approximate ones based on hash
      let lat, lng;
      if (coordinates) {
        [lat, lng] = coordinates;
      } else {
        // Simple hash-based coordinate generation for unknown cities
        const hash = entry.city.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        // Generate coordinates within reasonable bounds
        lat = ((Math.abs(hash) % 160) - 80) * 0.8; // -64 to 64
        lng = ((Math.abs(hash * 2) % 360) - 180) * 0.9; // -162 to 162
      }

      return {
        ...entry,
        lat,
        lng,
        isKnownLocation: !!coordinates
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const center = mapLocations.length > 0 
    ? [mapLocations[0].lat, mapLocations[0].lng]
    : [20, 0]; // Default center

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🗺️</div>
          <p className="text-gray-500 font-medium">No travel entries yet</p>
          <p className="text-gray-400 text-sm">Add some entries to see them on the map!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds locations={mapLocations} />
        
        {mapLocations.map((location) => (
          <Marker 
            key={location.id}
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(location)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{location.title}</h3>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < location.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  📍 {location.city}, {location.country}
                </p>
                
                <p className="text-sm text-gray-600 mb-2">
                  📅 {new Date(location.date).toLocaleDateString()}
                </p>
                
                {location.description && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {location.description}
                  </p>
                )}
                
                {location.photos && location.photos.length > 0 && (
                  <div className="mb-2">
                    <img
                      src={location.photos[0].data}
                      alt={location.title}
                      className="w-full h-20 object-cover rounded"
                    />
                    {location.photos.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{location.photos.length - 1} more photos
                      </p>
                    )}
                  </div>
                )}
                
                {location.expenses > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    💰 ${location.expenses.toFixed(2)}
                  </p>
                )}
                
                {!location.isKnownLocation && (
                  <p className="text-xs text-orange-500 mt-2">
                    ⚠️ Approximate location
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TravelMap;