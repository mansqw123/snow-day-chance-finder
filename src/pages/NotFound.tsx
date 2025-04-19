
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CloudSnow } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-indigo-900 p-4">
      <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg">
        <CloudSnow className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-blue-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">पेज नहीं मिला</p>
        <Button className="bg-blue-600 hover:bg-blue-700" asChild>
          <a href="/">वापस जाएं</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
