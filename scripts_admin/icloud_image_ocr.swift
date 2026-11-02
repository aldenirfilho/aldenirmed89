// OCR local, somente leitura. Entrada e saída JSONL; sem serviços externos.
import Foundation
import Vision
import ImageIO
import Darwin

struct OCRInput: Decodable {
    let id: String
    let path: String
}
struct OCRLine: Encodable {
    let text: String
    let confidence: Float
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}
struct OCROutput: Encodable {
    let id: String
    let ok: Bool
    let lines: [OCRLine]
    let engine: String
    let revision: Int?
    let languages: [String]
    let durationMs: Int
    let error: String?
}

func performOCR(_ input: OCRInput) -> OCROutput {
    let started = Date()
    func result(_ ok: Bool, lines: [OCRLine] = [], revision: Int? = nil,
                languages: [String] = [], error: String? = nil) -> OCROutput {
        return OCROutput(id: input.id, ok: ok, lines: lines, engine: "apple-vision-local",
                         revision: revision, languages: languages,
                         durationMs: Int(Date().timeIntervalSince(started) * 1000), error: error)
    }
    guard !input.id.isEmpty, !input.path.isEmpty, input.path.hasPrefix("/") else {
        return result(false, error: "invalid-request")
    }
    let url = URL(fileURLWithPath: input.path)
    do {
        let attributes = try FileManager.default.attributesOfItem(atPath: input.path)
        guard attributes[.type] as? FileAttributeType == .typeRegular else {
            return result(false, error: "not-a-regular-file")
        }
        if let size = attributes[.size] as? NSNumber, size.uint64Value > 64 * 1024 * 1024 {
            return result(false, error: "image-above-64mb")
        }
        guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, nil),
              let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [CFString: Any] else {
            return result(false, error: "image-unreadable")
        }
        let width = (properties[kCGImagePropertyPixelWidth] as? NSNumber)?.doubleValue ?? 0
        let height = (properties[kCGImagePropertyPixelHeight] as? NSNumber)?.doubleValue ?? 0
        guard width > 0, height > 0, width * height <= 80_000_000 else {
            return result(false, error: "invalid-or-excessive-image-dimensions")
        }
        let orientationRaw = (properties[kCGImagePropertyOrientation] as? NSNumber)?.uint32Value ?? 1
        let orientation = CGImagePropertyOrientation(rawValue: orientationRaw) ?? .up
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        // CLI local: evita inicialização de GPU/ANE dependente da sessão gráfica.
        request.usesCPUOnly = true
        if VNRecognizeTextRequest.supportedRevisions.contains(VNRecognizeTextRequestRevision3) {
            request.revision = VNRecognizeTextRequestRevision3
        }
        let supported = try request.supportedRecognitionLanguages()
        var languages = [String]()
        if supported.contains("pt-BR") { languages.append("pt-BR") }
        else if supported.contains("pt-PT") { languages.append("pt-PT") }
        if supported.contains("en-US") { languages.append("en-US") }
        if !languages.isEmpty { request.recognitionLanguages = languages }
        request.usesLanguageCorrection = true
        request.minimumTextHeight = 0.006
        request.preferBackgroundProcessing = false
        if #available(macOS 13.0, *) { request.automaticallyDetectsLanguage = false }
        let handler = VNImageRequestHandler(url: url, orientation: orientation, options: [:])
        try handler.perform([request])
        let lines: [OCRLine] = (request.results ?? []).prefix(1500).compactMap { observation in
            guard let candidate = observation.topCandidates(1).first else { return nil }
            let text = String(candidate.string.prefix(2000)).trimmingCharacters(in: .whitespacesAndNewlines)
            guard !text.isEmpty else { return nil }
            let box = observation.boundingBox
            return OCRLine(text: text, confidence: candidate.confidence,
                           x: Double(box.origin.x), y: Double(box.origin.y),
                           width: Double(box.size.width), height: Double(box.size.height))
        }
        return result(true, lines: lines, revision: request.revision, languages: languages)
    } catch {
        // Mensagem deliberadamente curta: o registro privado já identifica a imagem.
        let nsError = error as NSError
        return result(false, error: "vision-error-\(nsError.domain)-\(nsError.code)")
    }
}

let decoder = JSONDecoder()
let encoder = JSONEncoder()
encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
while let line = readLine() {
    let response: OCROutput = autoreleasepool {
        guard let data = line.data(using: .utf8),
              let request = try? decoder.decode(OCRInput.self, from: data) else {
            return OCROutput(id: "", ok: false, lines: [], engine: "apple-vision-local",
                             revision: nil, languages: [], durationMs: 0, error: "invalid-json-request")
        }
        return performOCR(request)
    }
    if let data = try? encoder.encode(response), let output = String(data: data, encoding: .utf8) {
        print(output)
        fflush(stdout)
    }
}
