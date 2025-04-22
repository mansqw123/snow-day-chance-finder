
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Snowflake } from "lucide-react";

// Component for showing snowflake animation
const SnowfallEffect = () => {
  // Create 20 snowflakes with random properties
  const snowflakes = Array.from({ length: 20 }, (_, i) => {
    const size = Math.random() * 1.5 + 0.5;
    const left = `${Math.random() * 100}%`;
    const animationDuration = `${Math.random() * 10 + 5}s`;
    const animationDelay = `${Math.random() * 5}s`;
    
    return (
      <div
        key={i}
        className="snowflake"
        style={{
          left,
          fontSize: `${size}em`,
          animationDuration,
          animationDelay,
        }}
      >
        ❄
      </div>
    );
  });
  
  return <div className="fixed inset-0 pointer-events-none">{snowflakes}</div>;
};

const Index = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [snowChance, setSnowChance] = useState<number | null>(null);
  const { toast } = useToast();

  const checkSnowChance = () => {
    // Simple validation
    if (!location || !date) {
      toast({
        title: "Missing information",
        description: "Please enter both location and date",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API with weather data
    // For demo, we'll generate a random probability
    const randomChance = Math.floor(Math.random() * 101);
    setSnowChance(randomChance);
    
    if (randomChance > 70) {
      toast({
        title: "High chance of snow!",
        description: "Better prepare for a snow day!",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SnowfallEffect />
      
      <h1 className="text-3xl font-bold text-center mb-8">
        Snow Day Chance Finder
      </h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Snowflake className="h-6 w-6 text-blue-500" />
            <span>Check Snow Day Probability</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location"
                placeholder="Enter city or zip code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={checkSnowChance}
            >
              Check Snow Chance
            </Button>
            
            {snowChance !== null && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-center font-semibold">
                  Chance of Snow: <span className="text-blue-600 text-xl">{snowChance}%</span>
                </p>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {snowChance > 70 ? "High chance of a snow day!" : 
                   snowChance > 40 ? "Moderate chance of snow." : 
                   "Low chance of snow."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
