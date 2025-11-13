//
//  Home.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI
import SwiftData

struct GridItem: Identifiable {
    let id = UUID()
    let text: String
    let color: Color
}


struct GridCellView: View {
    let item: GridItem

    var body: some View {
        RoundedRectangle(cornerRadius: 10)
            .fill(item.color)
            .frame(height: 100)
            .overlay(
                Text(item.text)
                    .foregroundColor(.white)
                    .font(.headline)
            )
    }
}


struct HomeView: View {
    @Query(sort: \Device.name) private var devices: [Device]
    @State private var selectedDevice: Device?
    @State private var latestData: Telemetry?
    @StateObject private var socket = WebSocketManager()
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Picker("Select Device", selection: $selectedDevice) {
                    ForEach(devices) { device in
                        Text(device.name).tag(device as Device?)
                    }
                }
                .pickerStyle(MenuPickerStyle())
                .padding(.horizontal)
                
                if let device = selectedDevice {
                    VStack(spacing: 12) {
                        Text(socket.status)
                            .font(.caption)
                            .foregroundColor(socket.status == "Connected" ? .green : .red)
                        
                        // Sensor Data
                        if let data = latestData {
                            VStack {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text("≠Temperature: \(data.temperature ?? 0, specifier: "%.1f") °C")
                                        Text("💨 Gas: \(data.gas ?? 0, specifier: "%.2f") ppm")
                                    }
                                    Spacer()
                                    VStack(alignment: .leading) {
                                        Text("⚡ A: \(data.currentA ?? 0, specifier: "%.2f") A")
                                        Text("⚡ B: \(data.currentB ?? 0, specifier: "%.2f") A")
                                        Text("⚡ C: \(data.currentC ?? 0, specifier: "%.2f") A")
                                        Text("⚡ D: \(data.currentD ?? 0, specifier: "%.2f") A")
                                    }
                                }
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(10)
                        } else {
                            Text("Fetching latest data...")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        // Socket Controls
                        HStack(spacing: 15) {
                            ForEach(1...4, id: \.self) { socketNum in
                                Button {
                                    Task {
                                        try? await APIService.shared.sendSocketCommand(deviceID: device.id, socket: socketNum, state: true)
                                        socket.sendCommand("{\"socket\": \(socketNum), \"state\": true}")
                                    }
                                } label: {
                                    VStack {
                                        Image(systemName: "power.circle.fill")
                                            .font(.largeTitle)
                                        Text("Socket \(socketNum)")
                                            .font(.caption)
                                    }
                                    .padding()
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(12)
                                }
                            }
                        }
                        .padding(.top)
                    }
                    .task {
                        socket.connect()
                        await fetchData(for: device)
                    }
                } else {
                    Spacer()
                    Text("Select a power strip to view data")
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
            .navigationTitle("Home")
        }
    }
    
    func fetchData(for device: Device) async {
        do {
            let data = try await APIService.shared.fetchLatestData(for: device.id)
            latestData = data
        } catch {
            print("Failed to fetch data: \(error)")
        }
    }
}

#Preview {
    // Hardcoded demo data
    let mockData = Data(
        timestamp: .now,
        temperature: 33.2,
        gas: 210.5,
        flame: 23.9,
        currentA: 1.2,
        currentB: 0.8,
        currentC: 0.3,
        currentD: 0.0
    )
    
    let mockDevice = Device(name: "Main Living Room", isConnected: true)
    mockDevice.latestData = mockData
    
    let container = try! ModelContainer(for: Device.self, Data.self)
    try! container.mainContext.insert(mockDevice)
    
    return HomeView()
        .modelContainer(container)
}
