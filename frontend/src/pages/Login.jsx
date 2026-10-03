import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      console.log("Login response:", response.data);

      const { token, user } = response.data;

      // Make sure backend returned the required data
      if (!token || !user) {
        setError("Login failed. Invalid server response.");
        return;
      }

      // Save login information permanently in browser
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Attach JWT to all future Axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("User saved:", user);
      console.log("Token saved:", token);

      // Go to Campus Connect Home
      const role = user.role?.toLowerCase();

if (role === "student") {
  navigate("/student-dashboard");
} else if (role === "organizer") {
  navigate("/dashboard");
} else if (role === "admin") {
  navigate("/admin");
} else {
  navigate("/home");
}

    } catch (err) {
      console.error("Login error:", err);
      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070817] text-white overflow-hidden relative">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Purple glow */}
        <div className="absolute -top-48 -left-40 w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[140px]" />

        {/* Pink glow */}
        <div className="absolute top-1/4 -right-48 w-[600px] h-[600px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

        {/* Blue glow */}
        <div className="absolute -bottom-48 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />

        {/* Event lights */}
        <div className="absolute top-20 left-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_30px_10px_rgba(139,92,246,0.4)]" />

        <div className="absolute top-1/3 left-[15%] w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_25px_8px_rgba(217,70,239,0.4)]" />

        <div className="absolute bottom-1/4 right-[20%] w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_30px_10px_rgba(99,102,241,0.4)]" />

        {/* Dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[length:32px_32px]" />
      </div>

      {/* ================= NAVBAR ================= */}
      <header className="relative z-20 border-b border-white/10 bg-[#070817]/70 backdrop-blur-xl">

        <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">
                🎟️
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Campus{" "}
                <span className="text-violet-400">
                  Connect
                </span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                Discover • Connect • Experience
              </p>
            </div>
          </Link>

          {/* Signup */}
          <div className="flex items-center gap-3">

            <span className="hidden sm:block text-sm text-white/50">
              New to Campus Connect?
            </span>

            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all"
            >
              Sign Up
            </Link>

          </div>
        </nav>
      </header>

      {/* ================= MAIN ================= */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-5 py-12">

        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* ================= LEFT EVENT PANEL ================= */}
          <section className="hidden lg:block">

            <div className="max-w-xl">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7">

                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />

                Welcome back to the experience

              </div>

              {/* Heading */}
              <h2 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">

                Your events.

                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Your moments.
                </span>

              </h2>

              {/* Description */}
              <p className="mt-6 text-lg leading-8 text-white/55 max-w-lg">
                Sign in to discover upcoming events, manage your
                registrations, access your tickets and stay connected
                with the experiences that matter to you.
              </p>

              {/* Event stats */}
              <div className="grid grid-cols-3 gap-3 mt-10">

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">

                  <div className="text-2xl mb-3">
                    🎪
                  </div>

                  <p className="text-sm font-bold">
                    Events
                  </p>

                  <p className="text-xs text-white/40 mt-1">
                    Discover
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">

                  <div className="text-2xl mb-3">
                    🎫
                  </div>

                  <p className="text-sm font-bold">
                    Tickets
                  </p>

                  <p className="text-xs text-white/40 mt-1">
                    Access
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">

                  <div className="text-2xl mb-3">
                    ⚡
                  </div>

                  <p className="text-sm font-bold">
                    Check-in
                  </p>

                  <p className="text-xs text-white/40 mt-1">
                    Real-time
                  </p>

                </div>

              </div>

              {/* Ticket decoration */}
              <div className="relative mt-10 max-w-md">

                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 blur-2xl" />

                <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden">

                  <div className="p-5 flex items-center gap-5">

                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-3xl">
                      🎟️
                    </div>

                    <div className="flex-1">

                      <p className="text-xs uppercase tracking-widest text-violet-300">
                        Campus Connect
                      </p>

                      <h3 className="font-bold mt-1">
                        Your next experience awaits.
                      </h3>

                      <div className="flex gap-3 mt-2 text-xs text-white/40">

                        <span>
                          ✦ Discover
                        </span>

                        <span>
                          ✦ Register
                        </span>

                        <span>
                          ✦ Experience
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="border-t border-dashed border-white/10" />

                  <div className="px-5 py-3 flex justify-between text-[10px] uppercase tracking-widest text-white/25">

                    <span>
                      EVENT PASS
                    </span>

                    <span>
                      CAMPUS CONNECT
                    </span>

                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* ================= LOGIN CARD ================= */}
          <section className="w-full max-w-md mx-auto">

            <div className="relative">

              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-indigo-600/30 rounded-[30px] blur-xl" />

              {/* Card */}
              <div className="relative rounded-[28px] border border-white/10 bg-[#101124]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 p-7 sm:p-9">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-7">

                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                    🎟️
                  </div>

                  <span className="font-bold">
                    Campus{" "}
                    <span className="text-violet-400">
                      Connect
                    </span>
                  </span>

                </div>

                {/* Heading */}
                <div className="mb-8">

                  <p className="text-violet-400 text-xs uppercase tracking-[0.2em] font-bold mb-2">
                    Welcome back
                  </p>

                  <h1 className="text-3xl font-black tracking-tight">
                    Sign in to Campus Connect
                  </h1>

                  <p className="text-sm text-white/45 mt-2">
                    Continue your event journey.
                  </p>

                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex gap-2">

                    <span>
                      ⚠️
                    </span>

                    <span>
                      {error}
                    </span>

                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}
                  <div>

                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-white/60 mb-2"
                    >
                      EMAIL ADDRESS
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        ✉️
                      </span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
                      />

                    </div>
                  </div>

                  {/* Password */}
                  <div>

                    <div className="flex justify-between items-center mb-2">

                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-white/60"
                      >
                        PASSWORD
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        🔒
                      </span>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>

                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between">

                    <label className="flex items-center gap-2 cursor-pointer">

                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500/30"
                      />

                      <span className="text-xs text-white/40">
                        Remember me
                      </span>

                    </label>

                    <span className="text-[10px] text-white/20">
                      Secure access
                    </span>

                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm shadow-xl shadow-violet-900/30 transition-all flex items-center justify-center gap-3"
                  >

                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In

                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </>
                    )}

                  </button>

                </form>

                {/* Signup */}
                <div className="mt-7 pt-6 border-t border-white/10 text-center">

                  <p className="text-sm text-white/40">

                    Don't have an account?{" "}

                    <Link
                      to="/signup"
                      className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    >
                      Create one
                    </Link>

                  </p>

                </div>

                {/* Security */}
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20">

                  <span>
                    🔒
                  </span>

                  Secure authentication

                  <span>
                    •
                  </span>

                  JWT protected

                </div>

              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <div className="absolute bottom-5 left-0 right-0 text-center pointer-events-none">

        <p className="text-[10px] uppercase tracking-[0.35em] text-white/15">
          Discover • Connect • Experience
        </p>

      </div>

    </div>
  );
};

export default Login;