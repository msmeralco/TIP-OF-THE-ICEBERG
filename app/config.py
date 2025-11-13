from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    MQTT_BROKER: str
    MQTT_PORT: int
    MQTT_USER: str | None = None
    MQTT_PASS: str | None = None

    THERMAL_THRESHOLD_CELSIUS: float = 60.0
    COOLING_PERIOD_MINUTES: int = 5
    SMOKE_THRESHOLD_FIRE: float = 50.0
    SMOKE_THRESHOLD_CRITICAL: float = 80.0
    TEMP_THRESHOLD_FIRE: float = 80.0

    class Config:
        env_file = ".env"


settings = Settings()