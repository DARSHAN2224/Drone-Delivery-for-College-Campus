import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import { api } from '../../stores/api.js';

const OrderTrackMap = ({ droneId, location }) => {
  const [coords, setCoords] = useState({ lat: location?.lat || 0, lng: location?.lng || 0 });
  const [status, setStatus] = useState('');

  useEffect(() => {
    let timer;
    let socket;
    const poll = async () => {
      try {
        if (!droneId) return;
        const res = await api.get(`/drone/status/${droneId}`);
        const d = res?.data?.data?.drone || {};
        if (d.location?.lat && d.location?.lng) {
          setCoords({ lat: d.location.lat, lng: d.location.lng });
        }
        if (d.status) setStatus(d.status);
      } catch {}
    };
    poll();
    timer = setInterval(poll, 5000);
    // Socket live updates - skip in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Development mode: OrderTrackMap Socket.IO connection skipped');
    } else {
      try {
        socket = io('http://localhost:8000', { 
          withCredentials: true,
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });
      
              socket.on('connect', () => {
          console.log('🔌 OrderTrackMap: Socket.IO connected');
          if (droneId) {
            socket.emit('join_drone', { droneId });
          }
        });
        
        socket.on('connect_error', (error) => {
          console.warn('🔌 OrderTrackMap: Socket.IO connection error:', error.message);
        });
        
        socket.on('drone:update', (payload) => {
          if (payload?.drone?.location?.lat && payload?.drone?.location?.lng) {
            setCoords({ lat: payload.drone.location.lat, lng: payload.drone.location.lng });
          }
          if (payload?.drone?.status) setStatus(payload.drone.status);
        });
      } catch (error) {
        console.warn('🔌 OrderTrackMap: Socket.IO setup error:', error.message);
      }
    }
    return () => {
      clearInterval(timer);
      try { socket?.disconnect(); } catch {}
    };
  }, [droneId]);
  const { lat, lng } = coords;
  return (
    <div className="w-full h-64 overflow-hidden rounded border">
      <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]}>
          <Popup>Drone {droneId || ''} • {status || 'location'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OrderTrackMap;


