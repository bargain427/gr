import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../contexts/AppContext';

const UserSetup = ({ onComplete }) => {
  const { initializeUser, loading, error } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null
      };

      await initializeUser(userData);
      onComplete();
    } catch (err) {
      console.error('Setup failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="text-6xl">🧬</div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome to GeneFit AI
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Let's set up your profile to provide personalized health insights
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Your height in cm"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Your weight in kg"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.email}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating Your Profile...
                  </>
                ) : (
                  <>
                    Continue to DNA Upload
                    <span className="ml-2">→</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>🔒 Your data is encrypted and secure. We never share your personal information.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSetup;