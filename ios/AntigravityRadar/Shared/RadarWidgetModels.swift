import Foundation

struct RadarWidgetFeed: Codable, Sendable {
    struct Privacy: Codable, Sendable {
        let telemetry: Bool
        let patientData: Bool
        let accountRequired: Bool
        let network: String
    }

    struct Safety: Codable, Sendable {
        let status: String
        let disclaimer: String
    }

    let schemaVersion: String
    let editionId: String
    let editorialDay: String
    let generatedAt: String
    let timezone: String
    let refreshAfterMinutes: Int
    let canonicalUrl: String
    let contentHash: String
    let privacy: Privacy
    let safety: Safety
    let items: [RadarWidgetItem]

    var canonicalURL: URL {
        URL(string: canonicalUrl) ?? RadarWidgetConstants.radarURL
    }

    static let fallback = RadarWidgetFeed(
        schemaVersion: "antigravity-radar-widget-feed-v1",
        editionId: "offline",
        editorialDay: "—",
        generatedAt: "—",
        timezone: "America/Fortaleza",
        refreshAfterMinutes: 60,
        canonicalUrl: RadarWidgetConstants.radarURL.absoluteString,
        contentHash: "offline",
        privacy: Privacy(
            telemetry: false,
            patientData: false,
            accountRequired: false,
            network: "fallback local"
        ),
        safety: Safety(
            status: "conteúdo local",
            disclaimer: "Apoio educacional. Abra o Radar para conferir a edição atual."
        ),
        items: [.fallback]
    )
}

struct RadarWidgetItem: Codable, Identifiable, Sendable {
    let id: String
    let priority: Int
    let section: String
    let topic: String
    let kind: String
    let evidenceLevel: String
    let title: String
    let source: String
    let sourceUrl: String
    let editorialPublishedAt: String
    let checkedAt: String
    let summary: String
    let takeaway: String
    let doNotInfer: String
    let temiHook: String
    let memoryAnchor: String
    let reviewStatus: String
    let deepLink: String

    var deepLinkURL: URL {
        URL(string: deepLink) ?? RadarWidgetConstants.radarURL
    }

    var sourceURL: URL? {
        URL(string: sourceUrl)
    }

    static let fallback = RadarWidgetItem(
        id: "offline",
        priority: 1,
        section: "scientific",
        topic: "Radar Diário",
        kind: "Fallback offline",
        evidenceLevel: "Atualização pendente",
        title: "Abra o Radar para sincronizar a edição mais recente",
        source: "Antigravity",
        sourceUrl: RadarWidgetConstants.radarURL.absoluteString,
        editorialPublishedAt: "—",
        checkedAt: "—",
        summary: "O widget mantém um snapshot local e tenta atualizar apenas pelo GitHub Pages oficial.",
        takeaway: "Conecte-se quando puder; o conteúdo salvo continua disponível.",
        doNotInfer: "O fallback não representa uma nova atualização clínica.",
        temiHook: "Retome um item por vez.",
        memoryAnchor: "LER → LIMITAR → RETOMAR",
        reviewStatus: "pending",
        deepLink: RadarWidgetConstants.radarURL.absoluteString
    )
}

enum RadarWidgetConstants {
    static let appGroup = "group.com.aldenirfilho.antigravity.radar"
    static let cacheKey = "antigravity:radar-widget-feed:v1"
    static let widgetKind = "com.aldenirfilho.antigravity.radar.widget"
    static let feedURL = URL(
        string: "https://aldenirfilho.github.io/antigravity-consultas/15_Radar_Cientifico/data/radar-widget-feed.json"
    )!
    static let radarURL = URL(
        string: "https://aldenirfilho.github.io/antigravity-consultas/15_Radar_Cientifico/"
    )!
    static let allowedFeedHost = "aldenirfilho.github.io"
}

enum RadarFeedOrigin: String, Sendable {
    case remote = "GitHub Pages"
    case appGroupCache = "cache compartilhado"
    case bundled = "snapshot do app"
    case fallback = "fallback local"
}

struct RadarLoadResult: Sendable {
    let feed: RadarWidgetFeed
    let origin: RadarFeedOrigin

    static let fallback = RadarLoadResult(
        feed: .fallback,
        origin: .fallback
    )
}
