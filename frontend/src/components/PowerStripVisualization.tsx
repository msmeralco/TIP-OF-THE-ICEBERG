import { Plug, Thermometer, Zap, Activity, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface Appliance {
  id: string;
  name: string;
  status: 'active' | 'cooling' | 'standby';
  temperature: number;
  current: number;
  power: number;
}

interface SocketData {
  socketId: number;
  appliance: Appliance | null;
}

interface PowerStripVisualizationProps {
  socketData: SocketData[];
  onToggleSocket: (socketId: number) => void;
  darkMode: boolean;
}

export function PowerStripVisualization({ socketData, onToggleSocket, darkMode }: PowerStripVisualizationProps) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cooling':
        return 'bg-orange-500';
      case 'standby':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 80) return 'text-red-600';
    if (temp > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getTempStatus = (temp: number) => {
    if (temp > 80) return { status: 'critical', icon: AlertTriangle, text: 'Critical' };
    if (temp > 60) return { status: 'warning', icon: AlertCircle, text: 'Warning' };
    return { status: 'normal', icon: CheckCircle, text: 'Normal' };
  };

  const getCurrentStatus = (current: number) => {
    if (current > 10) return { status: 'critical', icon: AlertTriangle, text: 'Overload' };
    if (current > 8) return { status: 'warning', icon: AlertCircle, text: 'High' };
    return { status: 'normal', icon: CheckCircle, text: 'Normal' };
  };

  const getPowerStatus = (power: number) => {
    if (power > 2500) return { status: 'critical', icon: AlertTriangle, text: 'High' };
    if (power > 2000) return { status: 'warning', icon: AlertCircle, text: 'Elevated' };
    return { status: 'normal', icon: CheckCircle, text: 'Normal' };
  };

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
          <Plug className="h-5 w-5 text-orange-500" />
          4-Socket Power Strip
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Power Strip Visualization */}
        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300'} border-2 rounded-xl p-6`}>
          <div className="flex items-center justify-between gap-4">
            {/* Power Cable */}
            <div className="flex items-center">
              <div className="w-12 h-2 bg-orange-400 rounded-l-full"></div>
            </div>
            
            {/* Sockets */}
            <div className="flex-1 grid grid-cols-4 gap-4">
              {socketData.map((socket) => (
                <div key={socket.socketId} className="flex flex-col items-center">
                  <div className="relative">
                    {/* Socket */}
                    <div className="w-20 h-20 bg-white border-4 border-orange-400 rounded-lg flex items-center justify-center shadow-lg">
                      <div className="space-y-1">
                        <div className="flex gap-2 justify-center">
                          <div className="w-2 h-6 bg-orange-300 rounded-full"></div>
                          <div className="w-2 h-6 bg-orange-300 rounded-full"></div>
                        </div>
                        <div className="w-6 h-2 bg-orange-300 rounded-full mx-auto"></div>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(socket.appliance?.status)}`}></div>
                  </div>
                  
                  {/* Socket Number */}
                  <span className="text-xs text-gray-600 mt-2">Socket {socket.socketId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appliance Details Below Each Socket */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {socketData.map((socket) => (
            <div key={socket.socketId} className="space-y-2">
              <div className={`text-center text-sm pb-2 border-b ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-orange-200'}`}>
                Socket {socket.socketId}
              </div>
              
              {socket.appliance ? (
                <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-white to-orange-50/30 border-orange-200'} border rounded-lg p-3 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-white' : ''}`}>{socket.appliance.name}</span>
                    {socket.appliance.status === 'active' && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">ON</Badge>
                    )}
                    {socket.appliance.status === 'cooling' && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">COOLING</Badge>
                    )}
                    {socket.appliance.status === 'standby' && (
                      <Badge variant="secondary" className="text-xs">OFF</Badge>
                    )}
                  </div>

                  {/* On/Off Control */}
                  {socket.appliance.status !== 'cooling' && (
                    <div className={`flex items-center justify-between p-2 ${darkMode ? 'bg-gray-600' : 'bg-orange-50'} rounded`}>
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Power Control</span>
                      <Switch
                        checked={socket.appliance.status === 'active'}
                        onCheckedChange={() => onToggleSocket(socket.socketId)}
                      />
                    </div>
                  )}

                  {/* Cooling Status Alert */}
                  {socket.appliance.status === 'cooling' && (
                    <div className="flex items-start gap-1 p-2 bg-orange-100 border border-orange-300 rounded text-xs">
                      <AlertCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-orange-900">Cooling Down</div>
                        <div className="text-orange-700 mt-0.5">Overheated - auto-shutoff activated. Will reset when safe.</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Metrics with Status Indicators */}
                  <div className="space-y-2 text-xs">
                    {/* Temperature */}
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Thermometer className={`h-3 w-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Temperature</span>
                        </div>
                        <span className={getTempColor(socket.appliance.temperature)}>
                          {socket.appliance.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const status = getTempStatus(socket.appliance.temperature);
                          const StatusIcon = status.icon;
                          return (
                            <>
                              <StatusIcon className={`h-3 w-3 ${
                                status.status === 'critical' ? 'text-red-600' :
                                status.status === 'warning' ? 'text-orange-600' :
                                'text-green-600'
                              }`} />
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {status.text} • Safe: {'<'}60°C
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Current */}
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Activity className={`h-3 w-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Current Draw</span>
                        </div>
                        <span className="text-orange-600">{socket.appliance.current.toFixed(1)} A</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const status = getCurrentStatus(socket.appliance.current);
                          const StatusIcon = status.icon;
                          return (
                            <>
                              <StatusIcon className={`h-3 w-3 ${
                                status.status === 'critical' ? 'text-red-600' :
                                status.status === 'warning' ? 'text-orange-600' :
                                'text-green-600'
                              }`} />
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {status.text} • Safe: {'<'}8A
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Power */}
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Zap className={`h-3 w-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Power Usage</span>
                        </div>
                        <span className="text-orange-600">{socket.appliance.power} W</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const status = getPowerStatus(socket.appliance.power);
                          const StatusIcon = status.icon;
                          return (
                            <>
                              <StatusIcon className={`h-3 w-3 ${
                                status.status === 'critical' ? 'text-red-600' :
                                status.status === 'warning' ? 'text-orange-600' :
                                'text-green-600'
                              }`} />
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {status.text} • Safe: {'<'}2000W
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 h-full flex items-center justify-center`}>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Empty</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

