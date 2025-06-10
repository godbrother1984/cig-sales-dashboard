
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Targets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [targets, setTargets] = useState({
    monthlySales: 3200000,
    monthlyGP: 800000,
    ytdSales: 15000000,
    ytdGP: 3500000
  });

  useEffect(() => {
    // Load existing targets from localStorage
    const savedTargets = localStorage.getItem('salesTargets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setTargets(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    // Save targets to localStorage
    localStorage.setItem('salesTargets', JSON.stringify(targets));
    toast({
      title: "Targets Saved",
      description: "Sales and GP targets have been updated successfully.",
    });
    
    // Navigate back to dashboard to see updated targets
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Target Management</h1>
              <p className="text-muted-foreground">Set monthly and YTD sales & GP targets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Monthly Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlySales">Monthly Sales Target (THB)</Label>
                  <Input
                    id="monthlySales"
                    type="number"
                    value={targets.monthlySales}
                    onChange={(e) => handleInputChange('monthlySales', e.target.value)}
                    placeholder="3,200,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyGP">Monthly GP Target (THB)</Label>
                  <Input
                    id="monthlyGP"
                    type="number"
                    value={targets.monthlyGP}
                    onChange={(e) => handleInputChange('monthlyGP', e.target.value)}
                    placeholder="800,000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YTD Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Year-to-Date Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ytdSales">YTD Sales Target (THB)</Label>
                  <Input
                    id="ytdSales"
                    type="number"
                    value={targets.ytdSales}
                    onChange={(e) => handleInputChange('ytdSales', e.target.value)}
                    placeholder="15,000,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ytdGP">YTD GP Target (THB)</Label>
                  <Input
                    id="ytdGP"
                    type="number"
                    value={targets.ytdGP}
                    onChange={(e) => handleInputChange('ytdGP', e.target.value)}
                    placeholder="3,500,000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Targets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Targets;
