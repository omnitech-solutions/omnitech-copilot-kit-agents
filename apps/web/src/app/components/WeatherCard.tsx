"use client";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="weather-icon">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" />
    </svg>
  );
}

export function WeatherCard({ location, themeColor }: { location?: string; themeColor: string }) {
  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="weather-card"
    >
      <div className="weather-inner">
        <div className="weather-header">
          <div>
            <h3 className="weather-title">{location}</h3>
            <p className="weather-meta">Current Weather</p>
          </div>
          <SunIcon />
        </div>

        <div className="weather-main">
          <div className="weather-temp">70°</div>
          <div className="weather-desc">Clear skies</div>
        </div>

        <div className="weather-stats">
            <div>
              <p className="weather-stat-label">Humidity</p>
              <p className="weather-stat-value">45%</p>
            </div>
            <div>
              <p className="weather-stat-label">Wind</p>
              <p className="weather-stat-value">5 mph</p>
            </div>
            <div>
              <p className="weather-stat-label">Feels Like</p>
              <p className="weather-stat-value">72°</p>
            </div>
        </div>
      </div>
    </div>
  );
}
