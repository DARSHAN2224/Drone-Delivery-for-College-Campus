import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Check weather conditions for drone delivery
export const checkWeatherConditions = async (lat, lng) => {
    try {
        if (!WEATHER_API_KEY) {
            console.warn('OpenWeather API key not configured, skipping weather check');
            return {
                isSafe: true,
                windSpeed: 0,
                rainProbability: 0,
                checkedAt: new Date()
            };
        }

        // Get current weather data
        const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
            params: {
                lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric'
            }
        });

        const { wind, rain, weather, visibility } = response.data;
        
        // Extract weather data
        const windSpeed = wind?.speed || 0; // m/s
        const rainProbability = rain?.['1h'] || 0; // mm
        const weatherCondition = weather?.[0]?.main?.toLowerCase() || '';
        
        // Determine if conditions are safe for drone delivery
        const isSafe = isWeatherSafeForDrone(windSpeed, rainProbability, weatherCondition, visibility);
        
        return {
            isSafe,
            windSpeed,
            rainProbability,
            weatherCondition,
            visibility,
            checkedAt: new Date()
        };
        
    } catch (error) {
        console.error('Weather API error:', error.message);
        
        // If weather check fails, assume safe conditions but log the error
        return {
            isSafe: true,
            windSpeed: 0,
            rainProbability: 0,
            weatherCondition: 'unknown',
            visibility: null,
            checkedAt: new Date(),
            error: 'Weather check failed, proceeding with delivery'
        };
    }
};

// Determine if weather conditions are safe for drone delivery
const isWeatherSafeForDrone = (windSpeed, rainProbability, weatherCondition, visibility) => {
    // Wind speed threshold (m/s) - adjust based on drone specifications
    const MAX_WIND_SPEED = 10; // 10 m/s = ~36 km/h
    
    // Rain threshold (mm) - adjust based on drone specifications
    const MAX_RAIN = 2; // 2mm per hour
    
    // Dangerous weather conditions
    const DANGEROUS_CONDITIONS = ['thunderstorm', 'snow', 'fog', 'mist'];
    // Visibility threshold (meters)
    const MIN_VISIBILITY = 800; // < 0.8 km considered unsafe
    
    // Check wind speed
    if (windSpeed > MAX_WIND_SPEED) {
        return false;
    }
    
    // Check rain probability
    if (rainProbability > MAX_RAIN) {
        return false;
    }
    
    // Check weather conditions
    if (DANGEROUS_CONDITIONS.includes(weatherCondition)) {
        return false;
    }
    // Check visibility
    if (typeof visibility === 'number' && visibility < MIN_VISIBILITY) {
        return false;
    }
    
    return true;
};

// Get weather forecast for planning deliveries
export const getWeatherForecast = async (lat, lng) => {
    try {
        if (!WEATHER_API_KEY) {
            throw new ApiError('Weather service unavailable', 503, 'OpenWeather API key not configured');
        }

        const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
            params: {
                lat,
                lon: lng,
                appid: WEATHER_API_KEY,
                units: 'metric'
            }
        });

        return response.data;
        
    } catch (error) {
        throw new ApiError('Weather forecast unavailable', 503, 'Unable to fetch weather forecast');
    }
};
