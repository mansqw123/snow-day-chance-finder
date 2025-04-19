
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Snowflake, 
  CloudSnow, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  Calendar, 
  CloudRain, 
  Cloud, 
  Sun, 
  Star, 
  History,
  Bookmark,
  BookmarkPlus
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

const weatherIcons = {
  Clear: <Sun className="h-10 w-10 text-yellow-500" />,
  Clouds: <Cloud className="h-10 w-10 text-gray-500" />,
  Rain: <CloudRain className="h-10 w-10 text-blue-500" />,
  Snow: <CloudSnow className="h-10 w-10 text-blue-400" />,
};

const Index = () => {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    chance: number;
    snow: number;
    temp: number;
    wind: number;
    weather: string;
    humidity: number;
    feels_like: number;
    date: string;
  } | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, []);

  const addToFavorites = (cityName: string) => {
    if (!favorites.includes(cityName)) {
      setFavorites([...favorites, cityName]);
      toast.success(`${cityName} को पसंदीदा में जोड़ा गया!`);
    }
  };

  const getWeather = async (cityName: string = city) => {
    if (!cityName.trim()) {
      setError("कृपया शहर का नाम दर्ज करें");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Using OpenWeatherMap API with metric units
      const API_KEY = "4d8fb5b93d4af21d66a2948710284366"; // Updated API key
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );

      const data = await response.json();
      
      if (data.cod && data.cod !== 200) {
        console.error("API Error:", data);
        if (data.cod === 401) {
          throw new Error("API कुंजी अमान्य है। कृपया वैध API कुंजी का उपयोग करें।");
        } else if (data.cod === 404) {
          throw new Error(`"${cityName}" शहर नहीं मिला। कृपया एक अलग शहर का नाम आज़माएँ।`);
        } else {
          throw new Error(data.message || "शहर नहीं मिला");
        }
      }
      
      // Extract the required weather data
      const temp = data.main.temp;
      const wind = data.wind.speed;
      const humidity = data.main.humidity;
      const feels_like = data.main.feels_like;
      const weather = data.weather[0].main;
      
      // Snow data might not be available for all locations
      const snow = data.snow && data.snow["1h"] ? data.snow["1h"] : 0;

      // Apply the prediction formula
      let chance = 0;
      if (snow > 5) chance += 70; // 5cm+ snow
      if (temp < -5) chance += 20; // Below -5°C
      if (wind > 14) chance += 10; // Wind speed > 14 m/s (50 km/h)

      // Cap the chance at 100%
      chance = Math.min(chance, 100);

      // Format date
      const date = new Date().toLocaleDateString('hi-IN');

      setResult({
        chance,
        snow,
        temp,
        wind,
        weather,
        humidity,
        feels_like,
        date
      });
      
      toast.success(`${cityName} का मौसम डेटा मिल गया!`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("कुछ गलत हुआ, कृपया दोबारा कोशिश करें");
      }
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
        <div className="flex items-center justify-center mb-4">
          <CloudSnow className="h-10 w-10 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-center text-blue-800">स्नो डे प्रेडिक्टर</h1>
        </div>
        
        <div className="flex justify-center items-center mb-4">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">{currentDate}</span>
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
              onClick={() => getWeather()} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? "लोड हो रहा है..." : "चेक करें ❄️"}
            </Button>
          </div>
          
          {favorites.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">पसंदीदा शहर:</p>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <Button
                    key={fav}
                    variant="outline"
                    size="sm"
                    onClick={() => getWeather(fav)}
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 text-yellow-500" />
                    {fav}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          {result && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{result.chance}%</div>
                  <div className="text-lg font-medium text-gray-700">
                    स्कूल बंद होने की संभावना
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  {weatherIcons[result.weather as keyof typeof weatherIcons] || 
                    weatherIcons.Clouds}
                  <span className="text-sm font-medium mt-1">{result.weather}</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addToFavorites(city)}
                className="mb-4 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <BookmarkPlus className="h-4 w-4 mr-1" />
                पसंदीदा में जोड़ें
              </Button>
              
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
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">अनुभव होता है</div>
                  <div className="font-semibold">{result.feels_like}°C</div>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">आर्द्रता</div>
                  <div className="font-semibold">{result.humidity}%</div>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-white rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                  <History className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-500">जाँच की तारीख</span>
                </div>
                <div className="text-sm font-medium">{result.date}</div>
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
