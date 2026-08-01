import SwiftUI

struct ContentView: View {
    @Environment(\.openURL) private var openURL
    @State private var result = RadarLoadResult.fallback
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 16) {
                    statusCard
                    ForEach(result.feed.items) { item in
                        radarCard(item)
                    }
                    installGuide
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Radar Diário")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task { await reload() }
                    } label: {
                        if isLoading {
                            ProgressView()
                        } else {
                            Label("Atualizar", systemImage: "arrow.clockwise")
                        }
                    }
                    .disabled(isLoading)
                }
            }
            .task { await reload() }
        }
    }

    private var statusCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("ACRA · TURBO TEMI", systemImage: "dot.radiowaves.left.and.right")
                .font(.caption.weight(.black))
                .foregroundStyle(.cyan)
            Text("Edição \(result.feed.editorialDay)")
                .font(.title2.bold())
            Text("Fonte: \(result.origin.rawValue) · sem conta ou telemetria")
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(result.feed.safety.disclaimer)
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 18))
    }

    private func radarCard(_ item: RadarWidgetItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("P\(item.priority)")
                    .font(.caption2.weight(.black))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(.cyan.opacity(0.16), in: Capsule())
                Text(item.topic)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
            Text(item.title)
                .font(.headline)
            Text(item.summary)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Label(item.memoryAnchor, systemImage: "bolt.fill")
                .font(.caption.weight(.bold))
                .foregroundStyle(.cyan)
            Button("Abrir no Radar") {
                openURL(item.deepLinkURL)
            }
            .buttonStyle(.borderedProminent)
            .tint(.cyan)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 18))
    }

    private var installGuide: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Adicionar o widget", systemImage: "apps.iphone")
                .font(.headline)
            Text("Na Tela de Início, mantenha pressionado → Editar → Adicionar Widget → procure “Radar Diário”.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Link("Abrir Estação Radar na web", destination: result.feed.canonicalURL)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 18))
    }

    @MainActor
    private func reload() async {
        isLoading = true
        result = await RadarFeedStore.shared.load()
        isLoading = false
    }
}

#Preview {
    ContentView()
}
