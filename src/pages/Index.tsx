
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Snowflake, CloudSnow, Wind, Thermometer } from "lucide-react";

const Index = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    chance: number;
    snow: number;
    temp: number;
    wind: number;
  } | null>(null);

  const getWeather = async () => {
    if (!city.trim()) {
      setError("कृपया शहर का नाम दर्ज करें");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Using OpenWeatherMap API with metric units
      const API_KEY = "4851471e5c74a0e9841bdc3198b3d5ef"; // Free tier API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("शहर नहीं मिला");
      }

      const data = await response.json();
      
      // Extract the required weather data
      const temp = data.main.temp;
      const wind = data.wind.speed;
      // Snow data might not be available for all locations
      const snow = data.snow && data.snow["1h"] ? data.snow["1h"] : 0;

      // Apply the prediction formula
      let chance = 0;
      if (snow > 5) chance += 70; // 5cm+ snow
      if (temp < -5) chance += 20; // Below -5°C
      if (wind > 14) chance += 10; // Wind speed > 14 m/s (50 km/h)

      // Cap the chance at 100%
      chance = Math.min(chance, 100);

      setResult({
        chance,
        snow,
        temp,
        wind
      });
    } catch (err) {
      console.error(err);
      setError("कुछ गलत हुआ, कृपया दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-indigo-900 p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <Card className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl relative z-10">
        <div className="flex items-center justify-center mb-6">
          <CloudSnow className="h-10 w-10 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-center text-blue-800">स्नो डे प्रेडिक्टर</h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="शहर टाइप करें, जैसे: शिमला"
              className="flex-grow"
            />
            <Button 
              onClick={getWeather} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "लोड हो रहा है..." : "चेक करें ❄️"}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">
              {error}
            </div>
          )}
          
          {result && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-600 mb-2">{result.chance}%</div>
                <div className="text-lg font-medium text-gray-700">
                  स्कूल बंद होने की संभावना
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Snowflake className="h-6 w-6 text-blue-500 mb-1" />
                  <div className="text-sm text-gray-500">बर्फ़</div>
                  <div className="font-semibold">{result.snow} cm</div>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Thermometer className="h-6 w-6 text-red-500 mb-1" />
                  <div className="text-sm text-gray-500">तापमान</div>
                  <div className="font-semibold">{result.temp}°C</div>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Wind className="h-6 w-6 text-gray-500 mb-1" />
                  <div className="text-sm text-gray-500">हवा</div>
                  <div className="font-semibold">{result.wind} m/s</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-4 text-xs text-blue-200 text-center">
        <p>OpenWeatherMap API का उपयोग करके बनाया गया</p>
        <p>© 2025 स्नो डे प्रेडिक्टर</p>
      </div>
    </div>
  );
};

export default Index;
