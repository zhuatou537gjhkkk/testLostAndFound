import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function LocationMarker({ setLatLng }) {
    const [position, setPosition] = useState(null)

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPosition(e.latlng)
            setLatLng({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) })
        }
    })

    return position ? <Marker position={position} icon={markerIcon} /> : null
}

export default function MapPicker({ setLatLng }) {
    return (
        <MapContainer center={[39.914, 116.403]} zoom={13} style={{ height: 300, width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setLatLng={setLatLng} />
        </MapContainer>
    )
}
