"""Thermal alerts component for displaying thermal events."""

import reflex as rx
from project_alisto.project_alisto import State


def thermal_alerts() -> rx.Component:
    """Display thermal alerts and event history."""
    return rx.vstack(
        # Active alerts banner
        rx.cond(
            State.has_thermal_events,
            rx.card(
                rx.hstack(
                    rx.icon("triangle_alert", size=24, color="orange"),
                    rx.vstack(
                        rx.heading("Recent Thermal Events", size="5"),
                        rx.text(
                            f"{State.thermal_events_count} event(s) recorded",
                            size="3",
                            color="gray"
                        ),
                        spacing="1",
                        align="start",
                    ),
                    spacing="3",
                    align="center",
                ),
                width="100%",
                padding="4",
                border_left="4px solid",
                border_color="orange",
                background_color="orange.2",
            ),
        ),
        
        # Event history list
        rx.cond(
            State.has_thermal_events,
            rx.vstack(
                rx.heading("Event History", size="5", margin_bottom="2"),
                rx.foreach(
                    State.thermal_events,
                    lambda event: rx.card(
                        rx.hstack(
                            rx.vstack(
                                rx.text(
                                    event.event_type,
                                    size="4",
                                    weight="bold"
                                ),
                                rx.text(
                                    event.message,
                                    size="2",
                                    color="gray"
                                ),
                                rx.text(
                                    event.formatted_timestamp,
                                    size="1",
                                    color="gray"
                                ),
                                align="start",
                                spacing="1",
                            ),
                            rx.badge(
                                f"Socket {event.socket_id}",
                                color_scheme="blue"
                            ),
                            justify="between",
                            width="100%",
                        ),
                        width="100%",
                        padding="3",
                    ),
                ),
                spacing="2",
                width="100%",
                max_height="400px",
                overflow_y="auto",
            ),
            rx.text(
                "No thermal events recorded",
                size="3",
                color="gray",
                text_align="center",
                width="100%",
            ),
        ),
        
        spacing="4",
        width="100%",
    )

