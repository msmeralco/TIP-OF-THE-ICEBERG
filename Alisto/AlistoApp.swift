//
//  AlistoApp.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI
import SwiftData

@main
struct AlistoApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Data.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
