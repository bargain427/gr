import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

const WearablesSync = ({ onSyncComplete }) => {
  const [connectedDevices, setConnectedDevices] = useState([
    { id: 'apple-watch', name: 'Apple Watch Series 9', connected: true, syncing: false, icon: '⌚', battery: 85 },
    { id: 'fitbit', name: 'Fitbit Charge 5', connected: true, syncing: false, icon: '📱', battery: 72 }
  ]);

  const [availableDevices] = useState([
    { id: 'google-fit', name: 'Google Fit', connected: false, icon: '🏃', description: 'Sync fitness data from Google Fit' },
    { id: 'samsung-health', name: 'Samsung Health', connected: false, icon: '💚', description: 'Connect Samsung Health data' },
    { id: 'garmin', name: 'Garmin Connect', connected: false, icon: '⌚', description: 'Import Garmin device metrics' },
    { id: 'withings', name: 'Withings Health Mate', connected: false, icon: '⚖️', description: 'Body composition and sleep data' },
    { id: 'oura', name: 'Oura Ring', connected: false, icon: '💍', description: 'Advanced sleep and recovery insights' },
    { id: 'whoop', name: 'WHOOP Strap', connected: false, icon: '📊', description: 'Heart rate variability and strain' }
  ]);

  const [syncingAll, setSyncingAll] = useState(false);

  const handleDeviceToggle = (deviceId) => {
    setConnectedDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, syncing: !device.syncing }
          : device
      )
    );
    
    // Simulate sync process
    setTimeout(() => {
      setConnectedDevices(prev => 
        prev.map(device => 
          device.id === deviceId 
            ? { ...device, syncing: false }
            : device
        )
      );
    }, 3000);
  };

  const handleSyncAll = () => {
    setSyncingAll(true);
    setConnectedDevices(prev => 
      prev.map(device => ({ ...device, syncing: true }))
    );

    setTimeout(() => {
      setSyncingAll(false);
      setConnectedDevices(prev => 
        prev.map(device => ({ ...device, syncing: false }))
      );
      onSyncComplete && onSyncComplete();
    }, 4000);
  };

  const healthMetrics = [
    { name: 'Heart Rate Zones', devices: ['Apple Watch', 'Fitbit'], status: 'Synced', icon: '❤️' },
    { name: 'Sleep Stages', devices: ['Fitbit'], status: 'Synced', icon: '😴' },
    { name: 'Activity Levels', devices: ['Apple Watch', 'Fitbit'], status: 'Synced', icon: '🏃' },
    { name: 'Body Temperature', devices: ['Apple Watch'], status: 'Synced', icon: '🌡️' },
    { name: 'Stress Levels', devices: ['Fitbit'], status: 'Synced', icon: '🧘' },
    { name: 'Blood Oxygen', devices: ['Apple Watch'], status: 'Synced', icon: '🫁' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Connect Your Wearables</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sync your fitness trackers and health devices to get real-time insights that complement your genetic profile.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
          >
            {syncingAll ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Syncing All Devices...
              </>
            ) : (
              <>
                Sync All Connected Devices
                <span className="ml-2">🔄</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connected Devices */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>Connected Devices</span>
                  <Badge variant="secondary">{connectedDevices.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedDevices.map((device) => (
                  <div key={device.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{device.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-4">
                            <span>Battery: {device.battery}%</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Connected
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {device.syncing && (
                          <span className="animate-spin text-blue-600">⏳</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeviceToggle(device.id)}
                          disabled={device.syncing || syncingAll}
                        >
                          {device.syncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Health Metrics Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Synced Health Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{metric.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{metric.name}</div>
                        <div className="text-xs text-gray-600">
                          From: {metric.devices.join(', ')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {metric.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Available Devices */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🔗</span>
                  <span>Available Integrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableDevices.map((device) => (
                  <div key={device.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{device.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-600">{device.description}</div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data Privacy */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Data Privacy & Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Real-time sync</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Share data with AI coach</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Automatic backup</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Anonymous analytics</span>
                    <Switch />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">🔒 Encrypted:</span> All your health data is encrypted end-to-end and never shared without your explicit permission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center pt-8">
          <Button 
            onClick={onSyncComplete}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full"
          >
            Continue to Dashboard
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WearablesSync;