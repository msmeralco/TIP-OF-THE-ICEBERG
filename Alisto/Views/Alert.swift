//
//  File.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI

struct AlertView: View {
    var body: some View {
        NavigationView {
            ScrollView(.vertical, showsIndicators: false) {
                Text("Alert!")
            }
            .navigationTitle(Text("Alert"))
        }
    }
}

#Preview {
    AlertView()
}

