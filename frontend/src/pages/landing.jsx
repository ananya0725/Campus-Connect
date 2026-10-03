import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-[#070817] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full text-center">

        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md mb-5">
            <span className="material-symbols-outlined text-4xl">
              event
            </span>
          </div>

          <p className="text-sm uppercase tracking-[0.35em] text-purple-300 font-semibold">
            Campus Connect
          </p>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Connect.
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Create. Celebrate.
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl leading-relaxed mb-10">
          Your smart campus event management platform to discover events,
          connect with people, manage activities, and make every campus
          experience memorable.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-lg hover:bg-gray-200 transition duration-300 shadow-lg"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md font-semibold text-lg hover:bg-white/20 transition duration-300"
          >
            Sign Up
          </Link>

        </div>

        {/* Bottom text */}
        <p className="mt-12 text-sm text-gray-500">
          Smart Event Management • Campus Connect
        </p>

      </div>
    </div>
  );
}

export default Landing;