import { useState, useEffect } from 'react';
import { Flame, Wind, ThermometerSun, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function FireDetectionPanel() {
  const [smokeLevel, setSmokeLevel] = useState(2);
  const [ambientTemp, setAmbientTemp] = useState(28);
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    // Simulate real-time sensor updates
    const interval = setInterval(() => {
      // Random fluctuations
      setSmokeLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setAmbientTemp(prev => Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update system status based on readings
    if (smokeLevel > 40 || ambientTemp > 50) {
      setSystemStatus('critical');
    } else if (smokeLevel > 20 || ambientTemp > 40) {
      setSystemStatus('warning');
    } else {
      setSystemStatus('normal');
    }
  }, [smokeLevel, ambientTemp]);

  const getStatusConfig = () => {
    switch (systemStatus) {
      case 'critical':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          badge: <Badge className="bg-red-500 hover:bg-red-600">Critical Alert</Badge>,
          message: 'Extreme conditions detected! BFP has been notified.',
        };
      case 'warning':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          badge: <Badge className="bg-orange-500 hover:bg-orange-600">Warning</Badge>,
          message: 'Irregular readings detected. Monitoring closely.',
        };
      default:
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          badge: <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>,
          message: 'All systems operating normally.',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${config.textColor}`} />
            <CardTitle>Fire Detection System</CardTitle>
          </div>
          {config.badge}
        </div>
        <CardDescription>{config.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smoke Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Smoke Level</span>
              </div>
              <span className={config.textColor}>{smokeLevel.toFixed(1)}%</span>
            </div>
            <Progress
              value={smokeLevel}
              className="h-2"
            />
            <p className="text-xs text-gray-500">
              {smokeLevel < 20 ? 'Clear' : smokeLevel < 40 ? 'Elevated' : 'Critical'}
            </p>
          </div>

          {/* Ambient Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThermometerSun className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Ambient Temp</span>
              </div>
              <span className={config.textColor}>{ambientTemp.toFixed(1)}°C</span>
            </div>
            <Progress
              value={(ambientTemp / 100) * 100}
              className="h-2"
            />
            <p className="text-xs text-gray-500">
              {ambientTemp < 35 ? 'Normal' : ambientTemp < 50 ? 'Warm' : 'Hot'}
            </p>
          </div>

          {/* System Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Protection Status</span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
              {systemStatus === 'critical' && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className={`${config.textColor}`}>
                  {systemStatus === 'critical' && 'Emergency Alert Active'}
                  {systemStatus === 'warning' && 'Monitoring Mode'}
                  {systemStatus === 'normal' && 'Protected'}
                </div>
                <p className="text-xs text-gray-600">
                  {systemStatus === 'critical' && 'BFP notified'}
                  {systemStatus === 'warning' && 'User notified'}
                  {systemStatus === 'normal' && 'No action needed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


