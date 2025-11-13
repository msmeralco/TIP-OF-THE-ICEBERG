import { Thermometer, Zap, Activity, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Appliance {
  id: string;
  name: string;
  status: 'active' | 'cooling' | 'standby';
  temperature: number;
  current: number;
  power: number;
  monthlyConsumption: number;
  lastAlert: string | null;
}

interface ApplianceCardProps {
  appliance: Appliance;
  onClick: () => void;
}

export function ApplianceCard({ appliance, onClick }: ApplianceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cooling':
        return 'bg-orange-500';
      case 'standby':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'cooling':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Cooling Down</Badge>;
      case 'standby':
        return <Badge variant="secondary">Standby</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 80) return 'text-red-600';
    if (temp > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Card
      className="border-orange-200 hover:border-orange-400 transition-all cursor-pointer hover:shadow-md bg-gradient-to-br from-white to-orange-50/30"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{appliance.name}</CardTitle>
          {getStatusBadge(appliance.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {appliance.lastAlert && (
          <div className="flex items-start gap-2 p-2 bg-orange-100 border border-orange-300 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-800">{appliance.lastAlert}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Temperature</span>
            </div>
            <span className={`${getTempColor(appliance.temperature)}`}>
              {appliance.temperature}°C
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <span className="text-orange-600">{appliance.current.toFixed(1)} A</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Power</span>
            </div>
            <span className="text-orange-600">{appliance.power} W</span>
          </div>
        </div>

        <div className="pt-2 border-t border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Monthly est.</span>
            <span className="text-sm text-orange-600">
              ₱{(appliance.monthlyConsumption * 11.5).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


