import { useState, useEffect } from 'react';
import { Flame, Zap, AlertTriangle, TrendingUp, ThermometerSun, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ApplianceCard } from './ApplianceCard';
import { FireDetectionPanel } from './FireDetectionPanel';
import { EnergyChart } from './EnergyChart';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

// Mock data for appliances
const mockAppliances = [
  {
    id: '1',
    name: 'Refrigerator',
    status: 'active',
    temperature: 42,
    current: 3.2,
    power: 750,
    monthlyConsumption: 180,
    lastAlert: null,
  },
  {
    id: '2',
    name: 'Air Conditioner',
    status: 'active',
    temperature: 65,
    current: 8.5,
    power: 2000,
    monthlyConsumption: 320,
    lastAlert: null,
  },
  {
    id: '3',
    name: 'Electric Kettle',
    status: 'cooling',
    temperature: 88,
    current: 0,
    power: 0,
    monthlyConsumption: 45,
    lastAlert: '2 minutes ago - Auto-shutdown due to high temperature',
  },
  {
    id: '4',
    name: 'Laptop Charger',
    status: 'active',
    temperature: 38,
    current: 0.4,
    power: 95,
    monthlyConsumption: 28,
    lastAlert: null,
  },
  {
    id: '5',
    name: 'Microwave',
    status: 'standby',
    temperature: 25,
    current: 0.05,
    power: 5,
    monthlyConsumption: 42,
    lastAlert: null,
  },
  {
    id: '6',
    name: 'Washing Machine',
    status: 'active',
    temperature: 52,
    current: 5.8,
    power: 1350,
    monthlyConsumption: 85,
    lastAlert: null,
  },
];

interface DashboardProps {
  onSelectAppliance: (id: string) => void;
}

export function Dashboard({ onSelectAppliance }: DashboardProps) {
  const [appliances, setAppliances] = useState(mockAppliances);
  const [totalPower, setTotalPower] = useState(0);
  const [estimatedBill, setEstimatedBill] = useState(0);

  useEffect(() => {
    // Calculate total power and estimated bill
    const total = appliances.reduce((sum, app) => sum + app.power, 0);
    const monthlyKwh = appliances.reduce((sum, app) => sum + app.monthlyConsumption, 0);
    // Meralco rate approximation: ₱11.50 per kWh
    const bill = monthlyKwh * 11.5;

    setTotalPower(total);
    setEstimatedBill(bill);
  }, [appliances]);

  useEffect(() => {
    // Simulate real-time updates and alerts
    const interval = setInterval(() => {
      const hasAlert = Math.random() > 0.95;

      if (hasAlert) {
        const alertTypes = [
          { message: 'Electric Kettle temperature spike detected', severity: 'warning' },
          { message: 'Air Conditioner unusual energy consumption', severity: 'info' },
        ];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        if (alert.severity === 'warning') {
          toast.warning(alert.message);
        } else {
          toast.info(alert.message);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const activeAppliances = appliances.filter(a => a.status === 'active').length;
  const alertCount = appliances.filter(a => a.lastAlert).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Total Power Usage</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{(totalPower / 1000).toFixed(2)} kW</div>
            <p className="text-xs text-gray-500 mt-1">Real-time consumption</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Estimated Bill</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">₱{estimatedBill.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">This month (Meralco rates)</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Active Appliances</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{activeAppliances} / {appliances.length}</div>
            <p className="text-xs text-gray-500 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-600">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{alertCount}</div>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Fire Detection Panel */}
      <FireDetectionPanel />

      {/* Energy Chart */}
      <EnergyChart />

      {/* Appliances Grid */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-orange-500" />
            Connected Appliances
          </CardTitle>
          <CardDescription>
            Real-time monitoring of temperature, current, and power consumption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appliances.map((appliance) => (
              <ApplianceCard
                key={appliance.id}
                appliance={appliance}
                onClick={() => onSelectAppliance(appliance.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


