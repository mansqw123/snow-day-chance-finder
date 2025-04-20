
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
  BookmarkPlus,
  Share,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

const weatherIcons = {
  Clear: <Sun className="h-10 w-10 text-yellow-500" />,
  Clouds: <Cloud className="h-10 w-10 text-gray-500" />,
  Rain: <CloudRain className="h-10 w-10 text-blue-500" />,
  Snow: <CloudSnow className="h-10 w-10 text-blue-400" />,
};

const supportedLanguages = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

const Index = () => {
  const [cityOrPin, setCityOrPin] = useState("");
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
    cityName: string;
  } | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [language, setLanguage] = useState<"hi" | "en" | "es" | "fr" | "de">(
    "hi"
  );
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const now = new Date();
    const localeMap: Record<string, string> = {
      hi: "hi-IN",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
    };

    const locale = localeMap[language] || "en-US";
    const formattedDate = now.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, [language]);

  const addToFavorites = (cityName: string) => {
    if (!favorites.includes(cityName)) {
      setFavorites([...favorites, cityName]);
      toast.success(
        language === "hi"
          ? `${cityName} को पसंदीदा में जोड़ा गया!`
          : language === "es"
          ? `${cityName} añadido a favoritos!`
          : language === "fr"
          ? `${cityName} ajouté aux favoris!`
          : language === "de"
          ? `${cityName} zu Favoriten hinzugefügt!`
          : `${cityName} added to favorites!`
      );
    }
  };

  // Improved getWeather to handle country codes in cityOrPin input and postal code + country detection
  const getWeather = async (location: string = cityOrPin) => {
    if (!location.trim()) {
      setError(
        language === "hi"
          ? "कृपया शहर या पिन कोड दर्ज करें"
          : language === "es"
          ? "Por favor, ingrese una ciudad o código postal"
          : language === "fr"
          ? "Veuillez entrer une ville ou un code postal"
          : language === "de"
          ? "Bitte geben Sie eine Stadt oder Postleitzahl ein"
          : "Please enter a city or postal code"
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const API_KEY = "4d8fb5b93d4af21d66a2948710284366";

      // Check if input contains comma, parse city and country
      // Examples: "London,UK" or "Mumbai,IN" or "75001,FR"
      let city = "";
      let countryCode = "";
      let zipOrCityParam = "";
      let url = "";

      const locationTrim = location.trim();
      if (locationTrim.includes(",")) {
        const parts = locationTrim.split(",");
        city = parts[0].trim();
        countryCode = parts[1].trim().toUpperCase();
      }

      // Detect postal code (digits) input
      // If with country code, use zip=ZIP,COUNTRY_CODE form as per OpenWeatherMap docs
      // Else if digits only, default to country based on some guess or fallback to US
      const postalInput = countryCode ? city : locationTrim;
      const isPostalCode = /^[0-9]{3,10}$/.test(postalInput);

      // Determine sensible default country for postal codes without country
      const getDefaultCountry = (postal: string) => {
        // Indian PIN code is 6 digits, starting typically from 1 to 9 (no 0 start)
        if (/^[1-9][0-9]{5}$/.test(postal)) {
          return "IN";
        }
        // Could add more rules here for other countries if needed
        return "US"; // fallback default
      };

      if (isPostalCode) {
        if (countryCode) {
          zipOrCityParam = `${city},${countryCode}`;
        } else {
          // Guess country for postal codes without country included
          const defaultCountry = getDefaultCountry(postalInput);
          zipOrCityParam = `${postalInput},${defaultCountry}`;
        }
        url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
          zipOrCityParam
        )}&appid=${API_KEY}&units=metric`;
      } else {
        // Use q parameter: city or city,country
        let cityParam = "";
        if (countryCode) {
          cityParam = `${city},${countryCode}`;
        } else {
          cityParam = locationTrim;
        }
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cityParam
        )}&appid=${API_KEY}&units=metric`;
      }

      const response = await fetch(url);

      const data = await response.json();

      if (data.cod && data.cod !== 200) {
        console.error("API Error:", data);
        if (data.cod === 401) {
          throw new Error(
            language === "hi"
              ? "API कुंजी अमान्य है। कृपया वैध API कुंजी का उपयोग करें।"
              : language === "es"
              ? "La clave API no es válida. Por favor, use una clave válida."
              : language === "fr"
              ? "La clé API n'est pas valide. Veuillez utiliser une clé valide."
              : language === "de"
              ? "API-Schlüssel ist ungültig. Bitte verwenden Sie einen gültigen Schlüssel."
              : "API key is invalid. Please use a valid API key."
          );
        } else if (data.cod === 404) {
          throw new Error(
            language === "hi"
              ? `"${location}" शहर या पिन कोड नहीं मिला। कृपया एक अलग इनपुट आज़माएँ।`
              : language === "es"
              ? `"${location}" ciudad o código postal no encontrado. Por favor, pruebe otro.`
              : language === "fr"
              ? `"${location}" ville ou code postal non trouvé. Veuillez essayer un autre.`
              : language === "de"
              ? `"${location}" Stadt oder Postleitzahl nicht gefunden. Bitte versuchen Sie es mit einem anderen.`
              : `"${location}" city or postal code not found. Please try another.`
          );
        } else {
          throw new Error(data.message || "Not found");
        }
      }

      const temp = data.main.temp;
      const wind = data.wind.speed;
      const humidity = data.main.humidity;
      const feels_like = data.main.feels_like;
      const weather = data.weather[0].main;
      const snow = data.snow && data.snow["1h"] ? data.snow["1h"] : 0;

      let chance = 0;
      if (snow > 5) chance += 70;
      if (temp < -5) chance += 20;
      if (wind > 14) chance += 10;
      chance = Math.min(chance, 100);

      const localeMapForDate = {
        hi: "hi-IN",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
      };

      const date = new Date().toLocaleDateString(
        localeMapForDate[language] || "en-US"
      );

      setResult({
        chance,
        snow,
        temp,
        wind,
        weather,
        humidity,
        feels_like,
        date,
        cityName: data.name,
      });

      toast.success(
        language === "hi"
          ? `${data.name} का मौसम डेटा मिल गया!`
          : language === "es"
          ? `¡Datos meteorológicos para ${data.name} recibidos!`
          : language === "fr"
          ? `Données météo pour ${data.name} reçues !`
          : language === "de"
          ? `Wetterdaten für ${data.name} empfangen!`
          : `Weather data for ${data.name} received!`
      );
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          language === "hi"
            ? "कुछ गलत हुआ, कृपया दोबारा कोशिश करें"
            : language === "es"
            ? "Algo salió mal, inténtelo de nuevo"
            : language === "fr"
            ? "Quelque chose a mal tourné, veuillez réessayer"
            : language === "de"
            ? "Etwas ist schief gelaufen, bitte versuchen Sie es erneut"
            : "Something went wrong, please try again"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!result) {
      toast.error(
        language === "hi"
          ? "कोई डेटा नहीं है साझा करने के लिए"
          : language === "es"
          ? "No hay datos para compartir"
          : language === "fr"
          ? "Pas de données à partager"
          : language === "de"
          ? "Keine Daten zum Teilen"
          : "No data to share"
      );
      return;
    }
    const shareText =
      language === "hi"
        ? `${result.cityName} में स्कूल बंद होने की संभावना: ${result.chance}%`
        : language === "es"
        ? `Probabilidad de cierre de escuelas en ${result.cityName}: ${result.chance}%`
        : language === "fr"
        ? `Chance de fermeture d'école à ${result.cityName} : ${result.chance}%`
        : language === "de"
        ? `Wahrscheinlichkeit der Schulschließung in ${result.cityName}: ${result.chance}%`
        : `Chance of school closure in ${result.cityName}: ${result.chance}%`;

    if (navigator.share) {
      navigator
        .share({
          title: "Snow Day Predictor",
          text: shareText,
        })
        .catch(() => {
          toast.error(
            language === "hi"
              ? "साझा करने में विफल"
              : language === "es"
              ? "Error al compartir"
              : language === "fr"
              ? "Échec du partage"
              : language === "de"
              ? "Teilen fehlgeschlagen"
              : "Failed to share"
          );
        });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(
        language === "hi"
          ? "साझा किया गया (क्लिपबोर्ड में कॉपी किया गया)"
          : language === "es"
          ? "Compartido (copiado al portapapeles)"
          : language === "fr"
          ? "Partagé (copié dans le presse-papiers)"
          : language === "de"
          ? "Geteilt (in die Zwischenablage kopiert)"
          : "Shared (copied to clipboard)"
      );
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
          <h1 className="text-3xl font-bold text-center text-blue-800">
            स्नो डे प्रेडिक्टर
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">{currentDate}</span>
          </div>
          <div>
            {/* Language dropdown expanded with more languages */}
            <select
              className="border rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value as "hi" | "en" | "es" | "fr" | "de"
                )
              }
              aria-label={
                language === "hi"
                  ? "भाषा चुनें"
                  : language === "es"
                  ? "Seleccione el idioma"
                  : language === "fr"
                  ? "Sélectionner la langue"
                  : language === "de"
                  ? "Sprache wählen"
                  : "Select Language"
              }
            >
              {supportedLanguages.map(({ code, label }) => (
                <option value={code} key={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={cityOrPin}
              onChange={(e) => setCityOrPin(e.target.value)}
              placeholder={
                language === "hi"
                  ? "शहर, देश (कोड) या पिन कोड टाइप करें, जैसे: शिमला या 814146 या 75001,FR"
                  : language === "es"
                  ? "Escriba ciudad, país (código) o código postal, ej.: Madrid o 75001,FR"
                  : language === "fr"
                  ? "Tapez ville, pays (code) ou code postal, ex: Paris ou 75001,FR"
                  : language === "de"
                  ? "Geben Sie Stadt, Land (Code) oder Postleitzahl ein, z.B.: Berlin oder 75001,FR"
                  : "Type city, country(code), or postal code, e.g.: London,UK or 75001,FR"
              }
              className="flex-grow"
            />
            <Button
              onClick={() => getWeather()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading
                ? language === "hi"
                  ? "लोड हो रहा है..."
                  : language === "es"
                  ? "Cargando..."
                  : language === "fr"
                  ? "Chargement..."
                  : language === "de"
                  ? "Wird geladen..."
                  : "Loading..."
                : language === "hi"
                ? "चेक करें ❄️"
                : language === "es"
                ? "Comprobar ❄️"
                : language === "fr"
                ? "Vérifier ❄️"
                : language === "de"
                ? "Prüfen ❄️"
                : "Check ❄️"}
            </Button>
          </div>

          {favorites.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">
                {language === "hi"
                  ? "पसंदीदा शहर:"
                  : language === "es"
                  ? "Ciudades favoritas:"
                  : language === "fr"
                  ? "Villes favorites :"
                  : language === "de"
                  ? "Lieblingsstädte:"
                  : "Favorite cities:"}
              </p>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <Button
                    key={fav}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCityOrPin(fav);
                      getWeather(fav);
                    }}
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
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {result.chance}%
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {language === "hi"
                      ? "स्कूल बंद होने की संभावना"
                      : language === "es"
                      ? "Probabilidad de cierre de escuelas"
                      : language === "fr"
                      ? "Chance de fermeture d'école"
                      : language === "de"
                      ? "Wahrscheinlichkeit der Schulschließung"
                      : "Chance of school closure"}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  {weatherIcons[result.weather as keyof typeof weatherIcons] ||
                    weatherIcons.Clouds}
                  <span className="text-sm font-medium mt-1">{result.weather}</span>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToFavorites(result.cityName)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                  aria-label={
                    language === "hi"
                      ? "पसंदीदा में जोड़ें"
                      : language === "es"
                      ? "Añadir a favoritos"
                      : language === "fr"
                      ? "Ajouter aux favoris"
                      : language === "de"
                      ? "Zu Favoriten hinzufügen"
                      : "Add to favorites"
                  }
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {language === "hi"
                    ? "पसंदीदा में जोड़ें"
                    : language === "es"
                    ? "Añadir a favoritos"
                    : language === "fr"
                    ? "Ajouter aux favoris"
                    : language === "de"
                    ? "Zu Favoriten hinzufügen"
                    : "Add to favorites"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                  aria-label={
                    language === "hi"
                      ? "साझा करें"
                      : language === "es"
                      ? "Compartir"
                      : language === "fr"
                      ? "Partager"
                      : language === "de"
                      ? "Teilen"
                      : "Share"
                  }
                >
                  <Share className="h-4 w-4" />
                  {language === "hi"
                    ? "साझा करें"
                    : language === "es"
                    ? "Compartir"
                    : language === "fr"
                    ? "Partager"
                    : language === "de"
                    ? "Teilen"
                    : "Share"}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Snowflake className="h-6 w-6 text-blue-500 mb-1" />
                  <div className="text-sm text-gray-500">
                    {language === "hi"
                      ? "बर्फ़"
                      : language === "es"
                      ? "Nieve"
                      : language === "fr"
                      ? "Neige"
                      : language === "de"
                      ? "Schnee"
                      : "Snow"}
                  </div>
                  <div className="font-semibold">{result.snow} cm</div>
                </div>

                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Thermometer className="h-6 w-6 text-red-500 mb-1" />
                  <div className="text-sm text-gray-500">
                    {language === "hi"
                      ? "तापमान"
                      : language === "es"
                      ? "Temperatura"
                      : language === "fr"
                      ? "Température"
                      : language === "de"
                      ? "Temperatur"
                      : "Temperature"}
                  </div>
                  <div className="font-semibold">{result.temp}°C</div>
                </div>

                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <Wind className="h-6 w-6 text-gray-500 mb-1" />
                  <div className="text-sm text-gray-500">
                    {language === "hi"
                      ? "हवा"
                      : language === "es"
                      ? "Viento"
                      : language === "fr"
                      ? "Vent"
                      : language === "de"
                      ? "Wind"
                      : "Wind"}
                  </div>
                  <div className="font-semibold">{result.wind} m/s</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">
                    {language === "hi"
                      ? "अनुभव होता है"
                      : language === "es"
                      ? "Sensación térmica"
                      : language === "fr"
                      ? "Ressenti"
                      : language === "de"
                      ? "Gefühlte Temperatur"
                      : "Feels Like"}
                  </div>
                  <div className="font-semibold">{result.feels_like}°C</div>
                </div>

                <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">
                    {language === "hi"
                      ? "आर्द्रता"
                      : language === "es"
                      ? "Humedad"
                      : language === "fr"
                      ? "Humidité"
                      : language === "de"
                      ? "Feuchtigkeit"
                      : "Humidity"}
                  </div>
                  <div className="font-semibold">{result.humidity}%</div>
                </div>
              </div>

              <div className="mt-4 p-2 bg-white rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                  <History className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-500">
                    {language === "hi"
                      ? "जाँच की तारीख"
                      : language === "es"
                      ? "Fecha de consulta"
                      : language === "fr"
                      ? "Date de vérification"
                      : language === "de"
                      ? "Überprüfungsdatum"
                      : "Checked date"}
                  </span>
                </div>
                <div className="text-sm font-medium">{result.date}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-4 text-xs text-blue-200 text-center">
        <p>
          {language === "hi"
            ? "OpenWeatherMap API का उपयोग करके बनाया गया"
            : language === "es"
            ? "Construido usando la API de OpenWeatherMap"
            : language === "fr"
            ? "Construit avec l'API OpenWeatherMap"
            : language === "de"
            ? "Mit der OpenWeatherMap-API erstellt"
            : "Built using OpenWeatherMap API"}
        </p>
        <p>© 2025 स्नो डे प्रेडिक्टर</p>
      </div>
    </div>
  );
};

export default Index;
