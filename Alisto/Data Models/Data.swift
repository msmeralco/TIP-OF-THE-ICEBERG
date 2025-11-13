//
//  Item.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import Foundation
import SwiftData

@Model
final class Data {
    var timestamp: Date
    @Attribute(.unique) var id: UUID
    var temperature: Double?
    var gas: Double?
    var flame: Double?
    var currentA: Double?
    var currentB: Double?
    var currentC: Double?
    var currentD: Double?
    
    init(timestamp: Date,
         id: UUID = UUID(),
         temperature: Double? = nil,
         gas: Double? = nil,
         flame: Double? = nil,
         currentA: Double? = nil,
         currentB: Double? = nil,
         currentC: Double? = nil,
         currentD: Double? = nil
    ) {
        self.timestamp = timestamp
        self.id = id
        self.temperature = temperature
        self.gas = gas
        self.flame = flame
        self.currentA = currentA
        self.currentB = currentB
        self.currentC = currentC
        self.currentD = currentD
    }
}
