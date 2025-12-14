'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import React from 'react';

const containerStyle = {
    width: '250px',
    height: '200px',
    borderRadius: '12px',
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    scrollwheel: false,
    draggable: false,
    clickableIcons: false,
    mapId: '4504f8b37365c3d0' // Optional styling
};

interface ServiceMiniMapProps {
    lat: number;
    lng: number;
}

const libraries: "places"[] = ["places"];

export default function ServiceMiniMap({ lat, lng }: ServiceMiniMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        // Re-use libraries to share the script instance if possible, though 'places' isn't largely needed here
        libraries: libraries
    });

    if (!isLoaded) {
        return (
            <div className="w-[250px] h-[200px] flex items-center justify-center bg-[#111] rounded-xl border border-white/10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden shadow-2xl border border-white/20">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={{ lat, lng }}
                zoom={14}
                options={mapOptions}
            >
                <Marker position={{ lat, lng }} />
            </GoogleMap>
        </div>
    );
}
