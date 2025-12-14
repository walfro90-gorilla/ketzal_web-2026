'use client';

import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useJsApiLoader } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

const libraries: ("places")[] = ["places"];

interface LocationData {
    name: string;
    place_id: string;
    lat: number;
    lng: number;
    address: string;
}

interface LocationAutocompleteProps {
    onSelect: (location: LocationData) => void;
    defaultValue?: string;
    className?: string;
}

export default function LocationAutocomplete({ onSelect, defaultValue, className }: LocationAutocompleteProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm p-2 border border-slate-700 rounded-md bg-[#0A0A0A]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading maps...</span>
            </div>
        );
    }

    return <PlacesInput onSelect={onSelect} defaultValue={defaultValue} className={className} />;
}

function PlacesInput({ onSelect, defaultValue, className }: LocationAutocompleteProps) {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            types: ['(cities)'], // Restrict to cities
        },
        defaultValue: defaultValue || '',
        debounce: 300,
    });

    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = async (description: string, placeId: string) => {
        setValue(description, false);
        clearSuggestions();
        setIsOpen(false);

        try {
            const results = await getGeocode({ address: description });
            const { lat, lng } = await getLatLng(results[0]);

            // Extract more specific city name if possible, or just use description
            // The description from Autocomplete with (cities) is usually "City, Country"

            onSelect({
                name: description,
                place_id: placeId,
                lat,
                lng,
                address: results[0].formatted_address
            });
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setIsOpen(true);
                    }}
                    disabled={!ready}
                    className={`w-full rounded-md border border-slate-700 bg-[#0A0A0A] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] ${className}`}
                    placeholder="Search for a city..."
                />
            </div>

            {status === "OK" && isOpen && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-[#161616] p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {data.map(({ place_id, description }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description, place_id)}
                            className="cursor-pointer select-none rounded-sm px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            {description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
