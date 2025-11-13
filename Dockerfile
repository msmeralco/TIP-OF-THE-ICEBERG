# Use a Python version that matches your pyproject.toml
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# --- ADD THIS SECTION ---
# Install system dependencies required by Reflex
# 'unzip' is required by reflex init to install the bun runtime
# 'curl' is also good to have for downloading packages
RUN apt-get update && apt-get install -y unzip curl && \
    rm -rf /var/lib/apt/lists/*
# --- END ADDITION ---

# Install Poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies for production
RUN poetry install --no-dev

# Copy the entire application source code
COPY . .

# Run the reflex init command to build the frontend
RUN poetry run reflex init

# Expose the port Railway will use
EXPOSE 8000

# Command to run the app. Railway will override $PORT.
CMD ["poetry", "run", "reflex", "run", "--env", "prod", "--host", "0.0.0.0", "--port", "$PORT"]