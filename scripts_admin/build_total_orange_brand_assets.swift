#!/usr/bin/env swift

import AppKit
import Foundation

enum BrandAssetError: Error, CustomStringConvertible {
    case usage
    case unreadable(String)
    case context
    case export(String)

    var description: String {
        switch self {
        case .usage:
            return "Uso: build_total_orange_brand_assets.swift <logo-gerado.png> <raiz-do-repositorio>"
        case .unreadable(let path):
            return "Não foi possível abrir a imagem: \(path)"
        case .context:
            return "Não foi possível criar o contexto gráfico."
        case .export(let path):
            return "Não foi possível exportar: \(path)"
        }
    }
}

func loadCGImage(_ path: String) throws -> CGImage {
    guard
        let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
        let representation = NSBitmapImageRep(data: data),
        let image = representation.cgImage
    else {
        throw BrandAssetError.unreadable(path)
    }
    return image
}

func rgbaContext(width: Int, height: Int) throws -> CGContext {
    guard let context = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: width * 4,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        throw BrandAssetError.context
    }
    context.interpolationQuality = .high
    return context
}

func writePNG(_ image: CGImage, to path: URL) throws {
    try FileManager.default.createDirectory(
        at: path.deletingLastPathComponent(),
        withIntermediateDirectories: true
    )
    let representation = NSBitmapImageRep(cgImage: image)
    guard let data = representation.representation(using: .png, properties: [:]) else {
        throw BrandAssetError.export(path.path)
    }
    do {
        try data.write(to: path, options: .atomic)
    } catch {
        throw BrandAssetError.export(path.path)
    }
}

func squareImage(from source: CGImage, size: Int) throws -> CGImage {
    let context = try rgbaContext(width: size, height: size)
    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: size, height: size))

    let sourceWidth = CGFloat(source.width)
    let sourceHeight = CGFloat(source.height)
    let scale = max(CGFloat(size) / sourceWidth, CGFloat(size) / sourceHeight)
    let drawWidth = sourceWidth * scale
    let drawHeight = sourceHeight * scale
    context.draw(
        source,
        in: CGRect(
            x: (CGFloat(size) - drawWidth) / 2,
            y: (CGFloat(size) - drawHeight) / 2,
            width: drawWidth,
            height: drawHeight
        )
    )
    guard let output = context.makeImage() else { throw BrandAssetError.context }
    return output
}

func monochromeMark(
    from source: CGImage,
    red: UInt8,
    green: UInt8,
    blue: UInt8
) throws -> CGImage {
    let width = source.width
    let height = source.height
    let context = try rgbaContext(width: width, height: height)
    context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height))

    guard let raw = context.data else { throw BrandAssetError.context }
    let pixels = raw.bindMemory(to: UInt8.self, capacity: width * height * 4)
    for index in stride(from: 0, to: width * height * 4, by: 4) {
        let strength = max(pixels[index], max(pixels[index + 1], pixels[index + 2]))
        let alpha: UInt8
        if strength <= 54 {
            alpha = 0
        } else if strength >= 142 {
            alpha = 255
        } else {
            alpha = UInt8((Int(strength) - 54) * 255 / 88)
        }
        pixels[index] = UInt8(Int(red) * Int(alpha) / 255)
        pixels[index + 1] = UInt8(Int(green) * Int(alpha) / 255)
        pixels[index + 2] = UInt8(Int(blue) * Int(alpha) / 255)
        pixels[index + 3] = alpha
    }
    guard let output = context.makeImage() else { throw BrandAssetError.context }
    return output
}

func drawText(
    _ text: String,
    in rect: NSRect,
    font: NSFont,
    color: NSColor,
    tracking: CGFloat = 0,
    lineSpacing: CGFloat = 0
) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byWordWrapping
    paragraph.lineSpacing = lineSpacing
    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .kern: tracking,
        .paragraphStyle: paragraph,
    ]
    (text as NSString).draw(in: rect, withAttributes: attributes)
}

func socialCard(from logo: CGImage) throws -> CGImage {
    let width = 1200
    let height = 630
    guard
        let representation = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: width,
            pixelsHigh: height,
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        ),
        let graphicsContext = NSGraphicsContext(bitmapImageRep: representation)
    else {
        throw BrandAssetError.context
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = graphicsContext
    defer { NSGraphicsContext.restoreGraphicsState() }

    let canvas = NSRect(x: 0, y: 0, width: width, height: height)
    NSColor(calibratedRed: 0.018, green: 0.010, blue: 0.004, alpha: 1).setFill()
    canvas.fill()

    if let gradient = NSGradient(colors: [
        NSColor(calibratedRed: 0.02, green: 0.01, blue: 0.005, alpha: 1),
        NSColor(calibratedRed: 0.11, green: 0.035, blue: 0.006, alpha: 1),
        NSColor(calibratedRed: 0.02, green: 0.01, blue: 0.005, alpha: 1),
    ]) {
        gradient.draw(in: canvas, angle: 0)
    }

    let glow = NSBezierPath(ovalIn: NSRect(x: 690, y: 42, width: 470, height: 470))
    NSColor(calibratedRed: 1, green: 0.29, blue: 0, alpha: 0.09).setFill()
    glow.fill()

    let orbitCenter = NSPoint(x: 936, y: 315)
    for inset in [38.0, 74.0, 112.0] {
        let orbit = NSBezierPath(ovalIn: NSRect(
            x: 686 + inset,
            y: 65 + inset * 0.55,
            width: 500 - inset * 2,
            height: 500 - inset * 1.1
        ))
        orbit.lineWidth = 1
        NSColor(calibratedRed: 1, green: 0.46, blue: 0.04, alpha: 0.17).setStroke()
        orbit.stroke()
    }
    for index in 0..<11 {
        let angle = (Double(index) / 11.0) * Double.pi * 2 - Double.pi / 2
        let point = NSPoint(
            x: orbitCenter.x + CGFloat(cos(angle)) * 224,
            y: orbitCenter.y + CGFloat(sin(angle)) * 224
        )
        let node = NSBezierPath(ovalIn: NSRect(x: point.x - 4, y: point.y - 4, width: 8, height: 8))
        NSColor(calibratedRed: 1, green: 0.55, blue: 0.08, alpha: 0.82).setFill()
        node.fill()
    }

    let logoImage = NSImage(cgImage: logo, size: NSSize(width: 1024, height: 1024))
    logoImage.draw(
        in: NSRect(x: 724, y: 74, width: 420, height: 420),
        from: .zero,
        operation: .sourceOver,
        fraction: 1,
        respectFlipped: false,
        hints: [.interpolation: NSImageInterpolation.high]
    )

    let pill = NSBezierPath(roundedRect: NSRect(x: 70, y: 508, width: 444, height: 42), xRadius: 21, yRadius: 21)
    NSColor(calibratedRed: 1, green: 0.34, blue: 0, alpha: 0.14).setFill()
    pill.fill()
    NSColor(calibratedRed: 1, green: 0.44, blue: 0.04, alpha: 0.7).setStroke()
    pill.lineWidth = 1
    pill.stroke()
    drawText(
        "MODO PRINCIPAL · LARANJA MECÂNICA",
        in: NSRect(x: 92, y: 517, width: 406, height: 23),
        font: NSFont.monospacedSystemFont(ofSize: 14, weight: .bold),
        color: NSColor(calibratedRed: 1, green: 0.67, blue: 0.22, alpha: 1),
        tracking: 1.15
    )

    drawText(
        "ALDENIRMED89",
        in: NSRect(x: 66, y: 365, width: 640, height: 92),
        font: NSFont.systemFont(ofSize: 68, weight: .heavy),
        color: NSColor(calibratedRed: 1, green: 0.96, blue: 0.91, alpha: 1),
        tracking: 0.2
    )
    drawText(
        "MEDICINA INTENSIVA\nPLANTÃO · TEMI",
        in: NSRect(x: 72, y: 240, width: 580, height: 110),
        font: NSFont.systemFont(ofSize: 31, weight: .bold),
        color: NSColor(calibratedRed: 1, green: 0.49, blue: 0.04, alpha: 1),
        tracking: 0.7,
        lineSpacing: 7
    )
    drawText(
        "Futebol total clínico: conhecimento em movimento,\nmódulos em rede e o próximo passo sempre visível.",
        in: NSRect(x: 72, y: 122, width: 600, height: 88),
        font: NSFont.systemFont(ofSize: 20, weight: .medium),
        color: NSColor(calibratedRed: 0.91, green: 0.80, blue: 0.70, alpha: 1),
        lineSpacing: 5
    )
    drawText(
        "IDENTIDADE AUTORAL · SEM AFILIAÇÃO ESPORTIVA OFICIAL",
        in: NSRect(x: 72, y: 66, width: 630, height: 28),
        font: NSFont.monospacedSystemFont(ofSize: 12, weight: .medium),
        color: NSColor(calibratedRed: 0.74, green: 0.55, blue: 0.40, alpha: 1),
        tracking: 0.8
    )

    let border = NSBezierPath(roundedRect: NSInsetRect(canvas, 18, 18), xRadius: 24, yRadius: 24)
    NSColor(calibratedRed: 1, green: 0.38, blue: 0.01, alpha: 0.32).setStroke()
    border.lineWidth = 2
    border.stroke()

    guard let output = representation.cgImage else { throw BrandAssetError.context }
    return output
}

do {
    guard CommandLine.arguments.count == 3 else { throw BrandAssetError.usage }
    let sourcePath = CommandLine.arguments[1]
    let root = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
    let source = try loadCGImage(sourcePath)
    let master = try squareImage(from: source, size: 1024)

    let masterPaths = [
        "assets/brand/aldenirmed89-total-orange-master.png",
        "assets/brand/antigravity-a-orbital-master.png",
        "assets/icons/antigravity-consultas-1024.png",
        "assets/icons/ios/apple-touch-icon-1024.png",
        "assets/img/logo.png",
        "logo_concept_3_book_1778036997285.png",
    ]
    for relative in masterPaths {
        try writePNG(master, to: root.appendingPathComponent(relative))
    }

    for size in [32, 64, 192, 512] {
        let resized = try squareImage(from: master, size: size)
        try writePNG(
            resized,
            to: root.appendingPathComponent("assets/icons/antigravity-consultas-\(size).png")
        )
    }
    for size in [120, 152, 167, 180] {
        let resized = try squareImage(from: master, size: size)
        try writePNG(
            resized,
            to: root.appendingPathComponent("assets/icons/ios/apple-touch-icon-\(size).png")
        )
        if size == 180 {
            try writePNG(resized, to: root.appendingPathComponent("assets/icons/apple-touch-icon.png"))
        }
    }

    let monoLight = try monochromeMark(from: master, red: 255, green: 247, blue: 237)
    let monoDark = try monochromeMark(from: master, red: 23, green: 7, blue: 0)
    for relative in [
        "assets/brand/aldenirmed89-total-orange-mono-light.png",
        "assets/brand/antigravity-a-orbital-mono-light.png",
    ] {
        try writePNG(monoLight, to: root.appendingPathComponent(relative))
    }
    for relative in [
        "assets/brand/aldenirmed89-total-orange-mono-dark.png",
        "assets/brand/antigravity-a-orbital-mono-dark.png",
    ] {
        try writePNG(monoDark, to: root.appendingPathComponent(relative))
    }

    let card = try socialCard(from: master)
    for relative in [
        "assets/brand/aldenirmed89-total-orange-social-card.png",
        "assets/brand/aldenirmed89-social-card.png",
    ] {
        try writePNG(card, to: root.appendingPathComponent(relative))
    }

    print("Identidade Laranja Mecânica gerada: master, ícones, marcas monocromáticas e cartão social.")
} catch {
    FileHandle.standardError.write(Data("\(error)\n".utf8))
    exit(1)
}
