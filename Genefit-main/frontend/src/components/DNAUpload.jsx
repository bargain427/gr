import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert } from './ui/alert';
import { dnaUploadSteps } from '../data/mockData';
import { dnaAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import DNAStrand from './DNAStrand';

const DNAUpload = ({ onUploadComplete }) => {
  const { user, refreshDashboard } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProvider || !user) {
      setError('Please select a file and provider');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload file to API
      const uploadResponse = await dnaAPI.upload(user.id, selectedProvider, selectedFile);
      setReportId(uploadResponse.id);
      
      // Simulate upload progress
      const uploadTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadTimer);
            startAnalysisTracking(uploadResponse.id);
            return 100;
          }
          return prev + 20;
        });
      }, 500);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || 'Upload failed');
      setIsUploading(false);
    }
  };

  const startAnalysisTracking = (reportId) => {
    // Track analysis progress
    const analysisTimer = setInterval(async () => {
      try {
        const status = await dnaAPI.getStatus(reportId);
        
        if (status.status === 'analyzed') {
          clearInterval(analysisTimer);
          setShowSuccess(true);
          await refreshDashboard(); // Refresh dashboard with new data
          setTimeout(() => {
            onUploadComplete && onUploadComplete();
          }, 2000);
        } else if (status.status === 'failed') {
          clearInterval(analysisTimer);
          setError('Analysis failed. Please try again.');
          setIsUploading(false);
        } else {
          // Update progress based on markers analyzed
          const progressSteps = Math.floor((status.progress / 100) * dnaUploadSteps.length);
          setAnalysisStep(progressSteps);
        }
      } catch (err) {
        console.error('Error tracking analysis:', err);
      }
    }, 2000);
  };

  const supportedFormats = [
    { name: '23andMe', format: '.txt', icon: '🧬', value: 'twenty_three_and_me' },
    { name: 'AncestryDNA', format: '.txt', icon: '🌳', value: 'ancestry_dna' },
    { name: 'MyHeritage', format: '.csv', icon: '👨‍👩‍👧‍👦', value: 'my_heritage' },
    { name: 'FamilyTreeDNA', format: '.csv', icon: '🌲', value: 'family_tree_dna' },
    { name: 'Generic', format: '.vcf', icon: '📄', value: 'generic' }
  ];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
              <p className="text-gray-600">Your personalized health insights are ready.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">847</div>
                  <div className="text-sm text-gray-600">Markers Analyzed</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-sm text-gray-600">Health Plans</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
            </div>

            <Button 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
              onClick={onUploadComplete}
            >
              View My Dashboard
              <span className="ml-2">→</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Upload Your DNA Report</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Unlock personalized health insights by uploading your genetic data from leading DNA testing companies.
          </p>
        </div>

        {!isUploading ? (
          <>
            {/* Supported Formats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📄</span>
                  <span>Supported DNA Report Formats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {supportedFormats.map((format, index) => (
                    <div 
                      key={index} 
                      className={`text-center p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedProvider === format.value 
                          ? 'bg-blue-100 border-2 border-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedProvider(format.value)}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="font-medium text-gray-900">{format.name}</div>
                      <div className="text-sm text-gray-600">{format.format}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <div className="space-y-4">
                    <div className="text-6xl">📁</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedFile ? selectedFile.name : 'Choose your DNA report file'}
                      </h3>
                      <p className="text-gray-600">
                        Drag and drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: .txt, .csv, .vcf (Max 50MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.csv,.vcf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📄</span>
                        <div>
                          <div className="font-medium text-gray-900">{selectedFile.name}</div>
                          <div className="text-sm text-gray-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleUpload}
                        disabled={!selectedProvider}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        Start Analysis
                        <span className="ml-2">🚀</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Alert className="border-green-200 bg-green-50">
              <span className="text-green-600">🔒</span>
              <div className="ml-2">
                <h4 className="font-semibold text-green-800">Your privacy is our priority</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your genetic data is encrypted, never shared with third parties, and you maintain full control over your information.
                </p>
              </div>
            </Alert>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <span className="text-red-600">⚠️</span>
                <div className="ml-2">
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </Alert>
            )}
          </>
        ) : (
          /* Analysis Progress */
          <div className="space-y-8">
            {/* Upload Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📤</span>
                  <span>Uploading DNA Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={uploadProgress} className="h-3" />
                <div className="text-center text-gray-600">
                  {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload Complete!'}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Steps */}
            {uploadProgress === 100 && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <DNAStrand size="large" animated={true} />
                </div>

                <div className="space-y-4">
                  {dnaUploadSteps.map((step, index) => (
                    <Card 
                      key={index} 
                      className={`border-0 shadow-lg transition-all duration-500 ${
                        index <= analysisStep ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            index <= analysisStep 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {index < analysisStep ? '✓' : step.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                            <p className="text-gray-600 text-sm">{step.description}</p>
                          </div>
                          <div className="text-2xl">
                            {index === analysisStep && index < analysisStep ? '⏳' : step.icon}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DNAUpload;