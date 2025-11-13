import reflex as rx
import os # Import os

config = rx.Config(
    app_name="project_alisto",
    # Add this line
    db_url=os.getenv("DATABASE_URL", "sqlite:///reflex.db"),
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)