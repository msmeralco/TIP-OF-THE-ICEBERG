"""Socket card component for displaying socket status."""

import reflex as rx
from project_alisto.project_alisto import State


def socket_card(socket_id: int) -> rx.Component:
    """Display a socket card with status, temperature, current, and controls."""
    return rx.card(
        rx.vstack(
            # Socket header
            rx.hstack(
                rx.heading(f"Socket {socket_id}", size="6"),
                rx.badge(
                    rx.cond(
                        State.sockets[socket_id].is_cooling,
                        "Cooling",
                        rx.cond(
                            State.sockets[socket_id].is_on,
                            "On",
                            "Off"
                        )
                    ),
                    color_scheme=rx.cond(
                        State.sockets[socket_id].is_cooling,
                        "orange",
                        rx.cond(
                            State.sockets[socket_id].is_on,
                            rx.cond(
                                # Check temperature thresholds
                                State.sockets[socket_id].temperature >= State.thermal_limits.max_temperature * 0.9,
                                "red",
                                rx.cond(
                                    State.sockets[socket_id].temperature >= State.thermal_limits.max_temperature * 0.7,
                                    "yellow",
                                    rx.cond(
                                        # Check current thresholds
                                        State.sockets[socket_id].current >= State.thermal_limits.max_current * 0.9,
                                        "red",
                                        rx.cond(
                                            State.sockets[socket_id].current >= State.thermal_limits.max_current * 0.7,
                                            "yellow",
                                            "green"
                                        )
                                    )
                                )
                            ),
                            "gray"
                        )
                    )
                ),
                justify="between",
                width="100%",
            ),
            
            # Temperature display
            rx.vstack(
                rx.text("Temperature", size="2", color="gray"),
                rx.hstack(
                    rx.heading(
                        f"{State.sockets[socket_id].temperature:.1f}°C",
                        size="8"
                    ),
                    rx.text(
                        f"/ {State.thermal_limits.max_temperature:.0f}°C",
                        size="3",
                        color="gray"
                    ),
                    align="baseline",
                ),
                align="start",
                width="100%",
            ),
            
            # Current display
            rx.vstack(
                rx.text("Current", size="2", color="gray"),
                rx.hstack(
                    rx.heading(
                        f"{State.sockets[socket_id].current:.2f}A",
                        size="8"
                    ),
                    rx.text(
                        f"/ {State.thermal_limits.max_current:.0f}A",
                        size="3",
                        color="gray"
                    ),
                    align="baseline",
                ),
                align="start",
                width="100%",
            ),
            
            # Cooling period countdown
            rx.cond(
                State.sockets[socket_id].is_cooling,
                rx.vstack(
                    rx.divider(),
                    rx.hstack(
                        rx.icon("timer", size=20),
                        rx.text(
                            f"Cooling: {State.sockets[socket_id].cooling_time_remaining}",
                            size="3",
                            color="orange",
                            weight="bold"
                        ),
                        align="center",
                        spacing="2",
                    ),
                    align="start",
                    width="100%",
                ),
            ),
            
            # Control buttons
            rx.divider(),
            rx.hstack(
                rx.button(
                    rx.cond(
                        State.sockets[socket_id].is_on,
                        "Turn Off",
                        "Turn On"
                    ),
                    on_click=State.toggle_socket(socket_id),
                    disabled=State.sockets[socket_id].is_cooling,
                    color_scheme=rx.cond(
                        State.sockets[socket_id].is_on,
                        "red",
                        "green"
                    ),
                    size="3",
                ),
                rx.button(
                    "Emergency Off",
                    on_click=State.shutdown_socket(socket_id),
                    color_scheme="red",
                    variant="outline",
                    size="3",
                ),
                spacing="3",
                width="100%",
            ),
            
            spacing="4",
            width="100%",
        ),
        width="100%",
        padding="4",
    )
