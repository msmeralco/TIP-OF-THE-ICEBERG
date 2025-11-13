//
//  Settings.swift
//  Alisto
//
//  Created by Harvy Angelo Tan on 11/13/25.
//

import SwiftUI

struct SettingView: View {
   var body: some View {
       NavigationView {
           ScrollView(.vertical, showsIndicators: false) {
               Text("Hello, World!")
           }
           .navigationTitle(Text("Setting"))
       }
   }
}

#Preview {
    SettingView()
}

