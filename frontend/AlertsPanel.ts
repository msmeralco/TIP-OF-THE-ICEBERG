import { AlertTriangle, Flame, Zap, ThermometerSun, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const mockAlerts = [
  {
    id: '1',
    type: 'thermal',
    severity: 'high',
    appliance: 'Electric Kettle',
    message: 'Auto-shutdown triggered due to high temperature (88°C)',
    timestamp: '2 minutes ago',
    status: 'active',
  },
  {
    id: '2',
    type: 'fire',
    severity: 'medium',
    appliance: 'General Area',
    message: 'Elevated smoke levels detected in surrounding area',
    timestamp: '15 minutes ago',
    status: 'monitoring',
  },
  {
    id: '3',
    type: 'energy',
    severity: 'low',
    appliance: 'Air Conditioner',
    message: 'Abnormal energy consumption detected (15% above average)',
    timestamp: '1 hour ago',
    status: 'resolved',
  },
  {
    id: '4',
    type: 'thermal',
    severity: 'high',
    appliance: 'Washing Machine',
    message: 'Temperature spike detected (65°C) - monitoring closely',
    timestamp: '2 hours ago',
    status: 'resolved',
  },
  {
    id: '5',
    type: 'fire',
    severity: 'critical',
    appliance: 'General Area',
    message: 'Critical temperature threshold exceeded - BFP notified',
    timestamp: 'Yesterday, 8:45 PM',
    status: 'resolved',
  },
  {
    id: '6',
    type: 'energy',
    severity: 'low',
    appliance: 'Refrigerator',
    message: 'Power consumption slightly elevated during defrost cycle',
    timestamp: 'Yesterday, 3:22 PM',
    status: 'resolved',
  },
];

export function AlertsPanel({ darkMode }: { darkMode: boolean }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'thermal':
        return <ThermometerSun className="h-5 w-5" />;
      case 'fire':
        return <Flame className="h-5 w-5" />;
      case 'energy':
        return <Zap className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 hover:bg-red-700">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-500 hover:bg-red-600">Active</Badge>;
      case 'monitoring':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Monitoring</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeAlerts = mockAlerts.filter(a => a.status === 'active');
  const monitoringAlerts = mockAlerts.filter(a => a.status === 'monitoring');
  const resolvedAlerts = mockAlerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${darkMode ? 'bg-red-900 border-red-700' : 'border-red-300 bg-red-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600">{activeAlerts.length}</div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-orange-900 border-orange-700' : 'border-orange-300 bg-orange-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-600">{monitoringAlerts.length}</div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Under observation</p>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-green-900 border-green-700' : 'border-green-300 bg-green-50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">{resolvedAlerts.length}</div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Successfully handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className={darkMode ? 'text-white' : ''}>Alert History</CardTitle>
          </div>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>
            Complete log of all system alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAlerts.map((alert, index) => (
              <div key={alert.id}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm mt-2">{alert.appliance}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{alert.message}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  {alert.status === 'resolved' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {index < mockAlerts.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BFP Alert Info */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Bureau of Fire Protection Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            In extreme fire detection situations, the system automatically alerts the Bureau of Fire Protection (BFP)
            in addition to triggering the local alarm and sending push notifications to your device.
            Critical alerts are transmitted when smoke levels exceed 50% or ambient temperature exceeds 60°C.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

