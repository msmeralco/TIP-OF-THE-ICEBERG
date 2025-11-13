//
//  ContentView.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var data: [Data]

    var body: some View {
    
            TabView {
                Tab("Home", systemImage: "house") {
                    HomeView()
                }
                
                
                Tab("Billing", systemImage: "bolt.fill") {
                    BillingView()
                }
                
                Tab("Alerts", systemImage: "exclamationmark.circle") {
                    AlertView()
                }
                
                Tab("Settings", systemImage: "gear") {
                    SettingView()
                }
                
            }
            .tabBarMinimizeBehavior(.onScrollDown)
        
        
    }

    private func addItem() {
        withAnimation {
            let newItem = Data(timestamp: Date())
            modelContext.insert(newItem)
        }
    }

    private func deleteItems(offsets: IndexSet) {
        withAnimation {
            for index in offsets {
                modelContext.delete(data[index])
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Data.self, inMemory: true)
}
