import reflex as rx
import os

config = rx.Config(
    app_name="project_alisto",
    db_url=os.getenv("DATABASE_URL", "sqlite:///reflex.db"),
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)
