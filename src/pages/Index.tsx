
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Snowflake } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Language text content
const translations = {
  en: {
    title: "Snow Day Chance Finder",
    checkProbability: "Check Snow Day Probability",
    location: "Location",
    locationPlaceholder: "Enter city or zip code",
    date: "Date",
    checkButton: "Check Snow Chance",
    chanceOfSnow: "Chance of Snow:",
    highChance: "High chance of a snow day!",
    moderateChance: "Moderate chance of snow.",
    lowChance: "Low chance of snow.",
    missingInfo: "Missing information",
    pleaseEnter: "Please enter both location and date",
    highSnowAlert: "High chance of snow!",
    prepareSnowDay: "Better prepare for a snow day!",
  },
  hi: {
    title: "स्नो डे चांस फाइंडर",
    checkProbability: "बर्फीली दिन की संभावना जांचें",
    location: "स्थान",
    locationPlaceholder: "शहर या ज़िप कोड दर्ज करें",
    date: "तारीख",
    checkButton: "बर्फ का मौका जांचें",
    chanceOfSnow: "बर्फ का मौका:",
    highChance: "बर्फीली दिन की उच्च संभावना!",
    moderateChance: "बर्फ की मध्यम संभावना।",
    lowChance: "बर्फ की कम संभावना।",
    missingInfo: "जानकारी अधूरी है",
    pleaseEnter: "कृपया स्थान और तारीख दोनों दर्ज करें",
    highSnowAlert: "बर्फ की उच्च संभावना!",
    prepareSnowDay: "बर्फीली दिन के लिए तैयार रहें!",
  }
};

// Component for showing snowflake animation
const SnowfallEffect = () => {
  // Create 50 snowflakes with random properties for more visible animation
  const snowflakes = Array.from({ length: 50 }, (_, i) => {
    const size = Math.random() * 1.5 + 0.5;
    const left = `${Math.random() * 100}%`;
    const animationDuration = `${Math.random() * 10 + 5}s`;
    const animationDelay = `${Math.random() * 5}s`;
    
    return (
      <div
        key={i}
        className="snowflake absolute"
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
  
  return <div className="fixed inset-0 pointer-events-none z-10">{snowflakes}</div>;
};

const Index = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [snowChance, setSnowChance] = useState<number | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("hi"); // Default to Hindi
  const { toast } = useToast();
  const t = translations[language];

  const checkSnowChance = () => {
    // Simple validation
    if (!location || !date) {
      toast({
        title: t.missingInfo,
        description: t.pleaseEnter,
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
        title: t.highSnowAlert,
        description: t.prepareSnowDay,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SnowfallEffect />
      
      <div className="flex justify-end mb-4">
        <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "hi")}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        {t.title}
      </h1>
      
      <Card className="max-w-md mx-auto shadow-lg border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center justify-center gap-2">
            <Snowflake className="h-6 w-6 text-blue-500" />
            <span>{t.checkProbability}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-700">
                {t.location}
              </label>
              <Input
                id="location"
                placeholder={t.locationPlaceholder}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1 text-gray-700">
                {t.date}
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
            </div>
            
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600" 
              onClick={checkSnowChance}
            >
              {t.checkButton}
            </Button>
            
            {snowChance !== null && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100 animate-fade-in">
                <p className="text-center font-semibold">
                  {t.chanceOfSnow} <span className="text-blue-600 text-xl">{snowChance}%</span>
                </p>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {snowChance > 70 ? t.highChance : 
                   snowChance > 40 ? t.moderateChance : 
                   t.lowChance}
                </p>
                {snowChance > 70 && (
                  <div className="flex justify-center mt-3">
                    <Snowflake className="h-8 w-8 text-blue-500 animate-pulse" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
