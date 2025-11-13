//
//  Sample.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI
import SwiftData
import Combine

// MARK: - Models

@Model
final class Device {
    @Attribute(.unique) var id: UUID
    var name: String
    var isConnected: Bool
    var latestData: Data?
    
    init(name: String, id: UUID = UUID(), isConnected: Bool = false) {
        self.id = id
        self.name = name
        self.isConnected = isConnected
    }
}

struct Telemetry: Decodable {
    var temperature: Double?
    var gas: Double?
    var flame: Double?
    var currentA: Double?
    var currentB: Double?
    var currentC: Double?
    var currentD: Double?
}
