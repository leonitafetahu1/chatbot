import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/");
  };

  return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black">
        <div className="text-center p-8 max-w-2xl">
          <div className="bg-red-500 text-blue-500 p-4">
            Tailwind is working!
          </div>
          {/* Logo */}
          <div className="mb-8">
            <img
                src="/uploads/4939e2f3-cc62-445c-9f3f-ab1a64079f28.webp"
                alt="Mrava AI"
                className="w-16 h-16 object-contain mx-auto block"
            />
            <div className="mt-4 text-2xl font-bold">Mrava</div>
          </div>

          {/* Error Message */}
          <div className="text-8xl md:text-9xl font-bold mb-4 opacity-90">404</div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h1>
          <p className="text-lg md:text-xl mb-8 opacity-80 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            <br />Let’s get you back to where you need to be.
          </p>

          {/* Action Button */}
          <button
              onClick={handleReturn}
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium transition-all duration-300 hover:bg-gray-800"
          >
            Return to Home
          </button>
        </div>
      </div>
  );
};

export default NotFound;
