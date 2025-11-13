//
//  WebSocket.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import Foundation
import Swift
import Combine

final class WebSocketManager: ObservableObject {
    let objectWillChange = ObservableObjectPublisher()
    
    @Published var status: String = "Disconnected"
    private var webSocketTask: URLSessionWebSocketTask?
    private let url = URL(string: "wss://your-api.up.railway.app/ws")!
    
    init() {}
    
    func connect() {
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        listen()
        status = "Connected"
    }
    
    func listen() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .failure(let error):
                print("WebSocket error: \(error)")
                self?.status = "Disconnected"
            case .success(let message):
                if case .string(let text) = message {
                    print("Received message: \(text)")
                    // Parse JSON telemetry here if needed
                    // Parse JSON telemetry here if needed
                    // Parse JSON telemetry here if needed
                    
                }
                self?.listen()
            }
        }
    }
    
    func sendCommand(_ command: String) {
        let message = URLSessionWebSocketTask.Message.string(command)
        webSocketTask?.send(message) { error in
            if let error = error {
                print("WebSocket send error: \(error)")
            }
        }
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        status = "Disconnected"
    }
}

// MARK: - API Service

final class APIService {
    static let shared = APIService()
    private let baseURL = "https://your-api.up.railway.app/api"
    
    func fetchLatestData(for deviceID: UUID) async throws -> Telemetry {
        let url = URL(string: "\(baseURL)/devices/\(deviceID)/latest")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(Telemetry.self, from: data)
    }
    
    func sendSocketCommand(deviceID: UUID, socket: Int, state: Bool) async throws {
        let url = URL(string: "\(baseURL)/devices/\(deviceID)/control")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["socket": socket, "state": state] as [String: Any]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        _ = try await URLSession.shared.data(for: request)
    }
}
