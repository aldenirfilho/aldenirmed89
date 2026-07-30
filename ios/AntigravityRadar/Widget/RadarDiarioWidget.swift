import SwiftUI
import WidgetKit

struct RadarEntry: TimelineEntry {
    let date: Date
    let feed: RadarWidgetFeed
    let item: RadarWidgetItem
    let origin: RadarFeedOrigin
}

struct RadarTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> RadarEntry {
        RadarEntry(
            date: Date(),
            feed: .fallback,
            item: .fallback,
            origin: .fallback
        )
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (RadarEntry) -> Void
    ) {
        Task {
            let result = await RadarFeedStore.shared.load(
                preferRemote: !context.isPreview
            )
            completion(entry(from: result, index: 0, date: Date()))
        }
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (Timeline<RadarEntry>) -> Void
    ) {
        Task {
            let result = await RadarFeedStore.shared.load()
            let now = Date()
            let visibleItems = Array(result.feed.items.prefix(3))
            let entries = visibleItems.enumerated().map { index, item in
                RadarEntry(
                    date: Calendar.current.date(
                        byAdding: .minute,
                        value: index * 20,
                        to: now
                    ) ?? now,
                    feed: result.feed,
                    item: item,
                    origin: result.origin
                )
            }
            let refreshDate = Calendar.current.date(
                byAdding: .minute,
                value: result.feed.refreshAfterMinutes,
                to: now
            ) ?? now.addingTimeInterval(3_600)
            completion(
                Timeline(
                    entries: entries.isEmpty
                        ? [entry(from: .fallback, index: 0, date: now)]
                        : entries,
                    policy: .after(refreshDate)
                )
            )
        }
    }

    private func entry(
        from result: RadarLoadResult,
        index: Int,
        date: Date
    ) -> RadarEntry {
        let items = result.feed.items
        let safeIndex = items.indices.contains(index) ? index : 0
        return RadarEntry(
            date: date,
            feed: result.feed,
            item: items[safeIndex],
            origin: result.origin
        )
    }
}

struct RadarDiarioWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: RadarEntry

    var body: some View {
        VStack(alignment: .leading, spacing: family == .systemSmall ? 7 : 9) {
            header
            Text(entry.item.title)
                .font(family == .systemSmall ? .subheadline.bold() : .headline)
                .lineLimit(family == .systemLarge ? 4 : 3)
            if family != .systemSmall {
                Text(entry.item.takeaway)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(family == .systemLarge ? 5 : 3)
            }
            if family == .systemLarge {
                Divider()
                Text("⚠️ NÃO CONCLUIR")
                    .font(.caption2.weight(.black))
                    .foregroundStyle(.orange)
                Text(entry.item.doNotInfer)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(4)
            }
            Spacer(minLength: 2)
            footer
        }
        .containerBackground(for: .widget) {
            LinearGradient(
                colors: [
                    Color(red: 0.03, green: 0.10, blue: 0.17),
                    Color(red: 0.06, green: 0.20, blue: 0.28),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
        .foregroundStyle(.white)
        .widgetURL(entry.item.deepLinkURL)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            "Radar Diário. \(entry.item.topic). \(entry.item.title). \(entry.item.takeaway)"
        )
    }

    private var header: some View {
        HStack(spacing: 6) {
            Image(systemName: "dot.radiowaves.left.and.right")
            Text("RADAR · P\(entry.item.priority)")
                .font(.caption2.weight(.black))
            Spacer()
            Text(entry.item.topic)
                .font(.caption2.weight(.semibold))
                .lineLimit(1)
        }
        .foregroundStyle(.cyan)
    }

    private var footer: some View {
        HStack(spacing: 5) {
            Image(systemName: "bolt.fill")
            Text(entry.item.memoryAnchor)
                .lineLimit(family == .systemSmall ? 2 : 1)
            Spacer(minLength: 2)
            if family != .systemSmall {
                Text(entry.feed.editorialDay)
            }
        }
        .font(.caption2.weight(.bold))
        .foregroundStyle(.cyan)
    }
}

struct RadarDiarioWidget: Widget {
    let kind = RadarWidgetConstants.widgetKind

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: RadarTimelineProvider()
        ) { entry in
            RadarDiarioWidgetView(entry: entry)
        }
        .configurationDisplayName("Radar Diário")
        .description("Atualizações clínicas Turbo TEMI com limites explícitos.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()
    }
}

#Preview(as: .systemMedium) {
    RadarDiarioWidget()
} timeline: {
    RadarEntry(
        date: Date(),
        feed: .fallback,
        item: .fallback,
        origin: .bundled
    )
}
