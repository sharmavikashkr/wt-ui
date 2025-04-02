import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useCallback, useMemo, useRef, useState } from "react";
import { MapState } from "../types";

const containerStyle = { width: "100vw", height: "100vh" };

const options = {
    fullscreenControl: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: true,
};

export default function WTGoogleMap(props: any) {
    const mapRef = useRef<google.maps.Map>();
    const { mapState, setMapState, events } = props;
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const markers = useMemo(() => {
        return events.map((e: any, i: any) => ({
            ...e,
            id: i,
            position: {
                lat: e.location?.latitude,
                lng: e.location?.longitude,
            },
        }));
    }, [events]);

    function handleLoad(map: google.maps.Map) {
        mapRef.current = map;
    }

    const handleCenterChanged = useCallback(() => {
        if (!mapRef.current) return;
        const newPos = mapRef.current.getCenter()?.toJSON();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setMapState((prevState: MapState) => ({
                ...prevState,
                view: {
                    ...prevState.view,
                    center: newPos,
                },
            }));
        }, 500);
    }, []);

    const handleZoomChanged = useCallback(() => {
        if (!mapRef.current) return;
        const newZoom = mapRef.current.getZoom();
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setMapState((prevState: MapState) => ({
                ...prevState,
                view: {
                    ...prevState.view,
                    zoom: newZoom,
                },
            }));
        }, 500);
    }, []);

    return (
        <div className="absolute inset-0 p-0 overscroll-none">
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ''}>
                <GoogleMap
                    key={123}
                    options={options}
                    onLoad={handleLoad}
                    mapContainerStyle={containerStyle}
                    center={mapState.view.center}
                    zoom={mapState.view.zoom}
                    onCenterChanged={handleCenterChanged}
                    onZoomChanged={handleZoomChanged}
                >
                    {markers.map((marker: any) => (
                        <Marker
                            key={marker.id}
                            position={marker.position}
                            onMouseOver={() => setHoveredMarker(marker.id)}
                            onMouseOut={() => setHoveredMarker(null)}>
                            {hoveredMarker === marker.id && (
                                <InfoWindow position={marker.position} onCloseClick={() => setHoveredMarker(null)}>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            {marker.description || marker.name}
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="py-1 px-2 rounded-full bg-gray-300">{marker.year}</div>
                                            {marker.tags.map((tag: string) => (
                                                <div key={tag} className="py-1 px-2 rounded-full bg-gray-300">{tag}</div>
                                            ))}
                                        </div>
                                    </div>
                                </InfoWindow>
                            )}
                        </Marker>
                    ))}
                </GoogleMap>
            </LoadScript>
        </div>
    );
}
