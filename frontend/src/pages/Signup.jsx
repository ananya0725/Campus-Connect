import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!formData.role) {
      setError("Please select your account type.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/auth/signup",
        formData
      );

      console.log("Signup successful:", response.data);

      setSuccess(
        "Account created successfully! Redirecting to home..."
      );

      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070817] text-white overflow-hidden relative">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px]" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_1px,transparent_1px)] bg-[length:32px_32px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/10 bg-[#070817]/70 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🎟️</span>
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

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-white/50">
              Already a member?
            </span>

            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left side */}
          <section className="hidden lg:block">
            <div className="max-w-xl">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-7">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Your next experience starts here
              </div>

              <h2 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                Make every
                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  event memorable.
                </span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/55 max-w-lg">
                Discover exciting events, connect with people, manage
                registrations and turn every gathering into an experience
                worth remembering.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-10">

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                  <div className="text-2xl mb-3">🎫</div>
                  <p className="text-sm font-semibold">
                    Easy Tickets
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    QR-coded tickets
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                  <div className="text-2xl mb-3">✨</div>
                  <p className="text-sm font-semibold">
                    Discover
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Find great events
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4">
                  <div className="text-2xl mb-3">⚡</div>
                  <p className="text-sm font-semibold">
                    Real-time
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Live check-ins
                  </p>
                </div>

              </div>

              <div className="relative mt-10 w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 blur-2xl" />

                <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-5 flex items-center gap-5">

                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-3xl">
                    🎪
                  </div>

                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-violet-300">
                      Featured experience
                    </p>

                    <h3 className="font-bold mt-1">
                      Your story begins with an event.
                    </h3>

                    <div className="flex gap-3 mt-2 text-xs text-white/40">
                      <span>📍 Anywhere</span>
                      <span>•</span>
                      <span>🎟️ Unlimited possibilities</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* Signup card */}
          <section className="w-full max-w-md mx-auto">

            <div className="relative">

              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-indigo-600/30 rounded-[30px] blur-xl" />

              <div className="relative rounded-[28px] border border-white/10 bg-[#101124]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 p-7 sm:p-9">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-5">
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
                    Join the experience
                  </p>

                  <h1 className="text-3xl font-black tracking-tight">
                    Create your account
                  </h1>

                  <p className="text-sm text-white/45 mt-2">
                    Start discovering and managing amazing events.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex gap-2">
                    <span>✓</span>
                    <span>{success}</span>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold text-white/60 mb-2"
                    >
                      FULL NAME
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        👤
                      </span>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

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
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-white/60 mb-2"
                    >
                      PASSWORD
                    </label>

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
                        placeholder="Create a strong password"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder:text-white/25 outline-none transition-all focus:border-violet-500/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-violet-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>

                    <p className="text-[11px] text-white/30 mt-2">
                      Use at least 6 characters.
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-xs font-semibold text-white/60 mb-2"
                    >
                      ACCOUNT TYPE
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      {/* Customer */}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            role: "customer",
                          }))
                        }
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.role === "customer"
                            ? "border-violet-500 bg-violet-500/15 ring-1 ring-violet-500/30"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-xl mb-2">
                          🎟️
                        </div>

                        <p className="text-sm font-bold">
                          Customer
                        </p>

                        <p className="text-[11px] text-white/35 mt-1">
                          Discover & attend events
                        </p>
                      </button>

                      {/* Organizer */}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            role: "organizer",
                          }))
                        }
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.role === "organizer"
                            ? "border-fuchsia-500 bg-fuchsia-500/15 ring-1 ring-fuchsia-500/30"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="text-xl mb-2">
                          🎤
                        </div>

                        <p className="text-sm font-bold">
                          Organizer
                        </p>

                        <p className="text-[11px] text-white/35 mt-1">
                          Create & manage events
                        </p>
                      </button>

                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm shadow-xl shadow-violet-900/30 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </>
                    )}
                  </button>

                </form>

                {/* Login */}
                <div className="mt-7 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-white/40">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    >
                      Login here
                    </Link>
                  </p>
                </div>

                <p className="text-center text-[10px] text-white/20 mt-5">
                  By creating an account, you agree to use Campus Connect
                  responsibly.
                </p>

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

export default Signup;