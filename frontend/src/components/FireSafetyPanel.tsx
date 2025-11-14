import { useState, useEffect } from 'react';
import { Flame, Wind, ThermometerSun, Shield, AlertTriangle, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export function FireSafetyPanel({ darkMode }: { darkMode: boolean }) {
  const [smokeLevel, setSmokeLevel] = useState(2);
  const [ambientTemp, setAmbientTemp] = useState(28);
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    // Simulate real-time sensor updates
    const interval = setInterval(() => {
      setSmokeLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setAmbientTemp(prev => Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-600',
          badge: <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>,
          message: 'BFP Notified',
        };
      case 'warning':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-300',
          textColor: 'text-orange-600',
          badge: <Badge className="bg-orange-500 hover:bg-orange-600">Warning</Badge>,
          message: 'Monitoring',
        };
      default:
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-600',
          badge: <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>,
          message: 'Protected',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor} h-full ${darkMode ? 'bg-gray-800' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
            <Flame className={`h-5 w-5 ${config.textColor}`} />
            Fire Safety
          </CardTitle>
          {config.badge}
        </div>
        <CardDescription className={`text-xs ${darkMode ? 'text-gray-400' : ''}`}>{config.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Smoke Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Smoke</span>
            </div>
            <span className={`text-sm ${config.textColor}`}>{smokeLevel.toFixed(1)}%</span>
          </div>
          <Progress value={smokeLevel} className="h-2" />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThermometerSun className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ambient</span>
            </div>
            <span className={`text-sm ${config.textColor}`}>{ambientTemp.toFixed(1)}°C</span>
          </div>
          <Progress value={(ambientTemp / 100) * 100} className="h-2" />
        </div>

        {/* Alert System Status */}
        <div className={`p-3 rounded-lg border ${config.borderColor} ${darkMode ? 'bg-gray-700' : config.bgColor}`}>
          <div className="flex items-start gap-2">
            <Bell className={`h-4 w-4 ${config.textColor} mt-0.5`} />
            <div className="flex-1">
              <div className={`text-sm ${config.textColor}`}>Alert System</div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {systemStatus === 'critical' && 'Local alarm activated. Bureau of Fire Protection has been notified.'}
                {systemStatus === 'warning' && 'Push notifications sent. Monitoring situation closely.'}
                {systemStatus === 'normal' && 'All sensors operational. No irregularities detected.'}
              </p>
            </div>
          </div>
        </div>

        {/* BFP Integration Info */}
        <div className={`p-3 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <div className={`text-xs ${darkMode ? 'text-orange-400' : 'text-orange-900'}`}>BFP Integration Active</div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-orange-700'}`}>
                Extreme situations trigger automatic Bureau of Fire Protection alerts
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

