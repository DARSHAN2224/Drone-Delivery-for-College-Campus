import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { useNotificationHelpers } from "../../utils/notificationHelpers";
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const register = useAuthStore((state) => state.register);
  const { onSuccess, onError } = useNotificationHelpers();

  const validateForm = () => {
    // ... (validation logic remains the same)
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const checks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
      };
      setPasswordStrength(checks);
      if (Object.values(checks).includes(false)) {
        newErrors.password = "Password does not meet all requirements";
      }
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ DEBUG LOG 2: Check the complete form data before sending
    console.log("SUBMITTING --->", formData);

    if (!validateForm()) return;

    try {
      const result = await register({ ...formData, role: 'user' });
      if (result.success) {
        onSuccess('Signup Successful', 'Please check your email for the verification code.');
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&role=user`);
      } else {
        onError('Signup Failed', result.error || 'Signup failed. Please try again.');
        setErrors({ general: result.error || "Signup failed. Please try again." });
      }
    } catch (err) {
      onError('Signup Failed', err.message || 'An unexpected error occurred');
      setErrors({ general: err.message || "Signup failed. Please try again." });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // ✅ DEBUG LOG 1: See every change as it happens
    console.log(`INPUT TRACE ---> Name: '${name}', Value: '${value}'`);

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Sign up to get started with our services
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <p>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 space-y-1">
                {[
                  { label: "At least 8 characters", key: "length" },
                  { label: "One uppercase letter", key: "uppercase" },
                  { label: "One lowercase letter", key: "lowercase" },
                  { label: "One number", key: "number" },
                  { label: "One special character", key: "special" },
                ].map(({ label, key }) => (
                  <p key={key} className={`text-sm flex items-center gap-1 ${passwordStrength[key] ? "text-green-600" : "text-gray-500"}`}>
                    {passwordStrength[key] ? (<CheckCircle className="h-4 w-4" />) : (<XCircle className="h-4 w-4" />)}
                    {label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Input */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              maxLength={10}
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Terms & Conditions
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <Info className="h-4 w-4" />
              {errors.acceptTerms}
            </p>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            Sign up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;