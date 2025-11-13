//
//  Devices.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI

struct BillingView: View {
    var body: some View { 
        NavigationView {
            ScrollView(.vertical, showsIndicators: false) {
                Text("Hello, World!")
            }
            .navigationTitle(Text("Billing"))
        }
    }
}

#Preview {
    BillingView()
}

