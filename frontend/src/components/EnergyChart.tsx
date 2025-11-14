import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const mockData = [
  { time: '00:00', power: 1.2, cost: 13.8 },
  { time: '03:00', power: 0.8, cost: 9.2 },
  { time: '06:00', power: 2.5, cost: 28.75 },
  { time: '09:00', power: 3.2, cost: 36.8 },
  { time: '12:00', power: 4.1, cost: 47.15 },
  { time: '15:00', power: 3.8, cost: 43.7 },
  { time: '18:00', power: 5.2, cost: 59.8 },
  { time: '21:00', power: 4.5, cost: 51.75 },
  { time: 'Now', power: 4.2, cost: 48.3 },
];

export function EnergyChart({ darkMode }: { darkMode: boolean }) {
  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'border-orange-200'}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <CardTitle className={darkMode ? 'text-white' : ''}>Energy Consumption Today</CardTitle>
        </div>
        <CardDescription className={darkMode ? 'text-gray-400' : ''}>Real-time power usage and cost estimation</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#fed7aa'} />
            <XAxis
              dataKey="time"
              stroke={darkMode ? '#9ca3af' : '#9a3412'}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="left"
              stroke={darkMode ? '#9ca3af' : '#ea580c'}
              style={{ fontSize: '12px' }}
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: darkMode ? '#9ca3af' : '#ea580c' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={darkMode ? '#9ca3af' : '#f97316'}
              style={{ fontSize: '12px' }}
              label={{ value: 'Cost (₱)', angle: 90, position: 'insideRight', fill: darkMode ? '#9ca3af' : '#f97316' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#fff7ed',
                border: `1px solid ${darkMode ? '#374151' : '#fed7aa'}`,
                borderRadius: '8px',
                color: darkMode ? '#fff' : '#000'
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="power"
              stroke="#ea580c"
              strokeWidth={2}
              dot={{ fill: '#ea580c', r: 4 }}
              activeDot={{ r: 6 }}
              name="Power (kW)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
              activeDot={{ r: 6 }}
              name="Cost (₱)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


