import Foundation

actor RadarFeedStore {
    static let shared = RadarFeedStore()

    private let decoder = JSONDecoder()
    private let cache: UserDefaults?

    init(
        cache: UserDefaults? = UserDefaults(
            suiteName: RadarWidgetConstants.appGroup
        )
    ) {
        self.cache = cache
    }

    func load(preferRemote: Bool = true) async -> RadarLoadResult {
        if preferRemote, let remote = try? await loadRemote() {
            cache?.set(remote, forKey: RadarWidgetConstants.cacheKey)
            if let feed = try? decode(remote) {
                return RadarLoadResult(feed: feed, origin: .remote)
            }
        }
        if
            let cachedData = cache?.data(forKey: RadarWidgetConstants.cacheKey),
            let feed = try? decode(cachedData)
        {
            return RadarLoadResult(feed: feed, origin: .appGroupCache)
        }
        if
            let bundledURL = Bundle.main.url(
                forResource: "radar-widget-feed",
                withExtension: "json"
            ),
            let data = try? Data(contentsOf: bundledURL),
            let feed = try? decode(data)
        {
            return RadarLoadResult(feed: feed, origin: .bundled)
        }
        return .fallback
    }

    private func loadRemote() async throws -> Data {
        let url = RadarWidgetConstants.feedURL
        guard
            url.scheme == "https",
            url.host == RadarWidgetConstants.allowedFeedHost
        else {
            throw RadarFeedError.untrustedEndpoint
        }
        var request = URLRequest(
            url: url,
            cachePolicy: .reloadRevalidatingCacheData,
            timeoutInterval: 8
        )
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await URLSession.shared.data(for: request)
        guard
            let http = response as? HTTPURLResponse,
            (200 ... 299).contains(http.statusCode),
            data.count <= 256_000
        else {
            throw RadarFeedError.invalidResponse
        }
        _ = try decode(data)
        return data
    }

    private func decode(_ data: Data) throws -> RadarWidgetFeed {
        let feed = try decoder.decode(RadarWidgetFeed.self, from: data)
        guard
            feed.schemaVersion == "antigravity-radar-widget-feed-v1",
            (1 ... 12).contains(feed.items.count),
            feed.refreshAfterMinutes >= 15,
            feed.refreshAfterMinutes <= 360,
            feed.privacy.telemetry == false,
            feed.privacy.patientData == false,
            feed.items.allSatisfy({ item in
                item.deepLinkURL.scheme == "https"
                    && item.deepLinkURL.host
                        == RadarWidgetConstants.allowedFeedHost
                    && item.title.count <= 220
            })
        else {
            throw RadarFeedError.invalidContract
        }
        return feed
    }
}

private enum RadarFeedError: Error {
    case untrustedEndpoint
    case invalidResponse
    case invalidContract
}
