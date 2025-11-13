import reflex as rx

config = rx.Config(
    app_name="project_alisto",
    plugins=[
        rx.plugins.SitemapPlugin(),
        rx.plugins.TailwindV4Plugin(),
    ]
)