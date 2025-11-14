import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Toaster } from './ui/sonner';
import { PowerStripVisualization } from './PowerStripVisualization';
import { FireSafetyPanel } from './FireSafetyPanel';
import { EnergyChart } from './EnergyChart';

// Mock data for 4 sockets
const mockSocketData = [
  {
    socketId: 1,
    appliance: {
      id: '1',
      name: 'Refrigerator',
      status: 'active',
      temperature: 42,
      current: 3.2,
      power: 750,
    }
  },
  {
    socketId: 2,
    appliance: {
      id: '2',
      name: 'Air Conditioner',
      status: 'active',
      temperature: 65,
      current: 8.5,
      power: 2000,
    }
  },
  {
    socketId: 3,
    appliance: {
      id: '3',
      name: 'Electric Kettle',
      status: 'cooling',
      temperature: 88,
      current: 0,
      power: 0,
    }
  },
  {
    socketId: 4,
    appliance: null // Empty socket
  },
];

export function Home({ darkMode }: { darkMode: boolean }) {
  const [socketData, setSocketData] = useState(mockSocketData);

  const toggleSocket = (socketId: number) => {
    setSocketData(prev => prev.map(socket => {
      if (socket.socketId === socketId && socket.appliance) {
        const newStatus = socket.appliance.status === 'active' ? 'standby' : 'active';
        toast.info(`Socket ${socketId}: ${socket.appliance.name} turned ${newStatus === 'active' ? 'ON' : 'OFF'}`);

        return {
          ...socket,
          appliance: {
            ...socket.appliance,
            status: newStatus as 'active' | 'cooling' | 'standby',
            current: newStatus === 'active' ? socket.appliance.current || 3.0 : 0,
            power: newStatus === 'active' ? socket.appliance.power || 500 : 0,
          }
        };
      }
      return socket;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Power Strip + Fire Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PowerStripVisualization socketData={socketData} onToggleSocket={toggleSocket} darkMode={darkMode} />
        </div>
        <div>
          <FireSafetyPanel darkMode={darkMode} />
        </div>
      </div>

      {/* Real-Time Power Consumption Graph */}
      <EnergyChart darkMode={darkMode} />
    </div>
  );
}


