#!/usr/bin/env swift

import AppKit
import Foundation

enum AssetError: Error, CustomStringConvertible {
    case usage
    case unreadable(String)
    case context
    case export(String)

    var description: String {
        switch self {
        case .usage:
            return "Uso: build_orbital_brand_assets.swift <logo-master.png> <cartao-social-origem.png> <pasta-destino>"
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
        throw AssetError.unreadable(path)
    }
    return image
}

func writePNG(_ image: CGImage, to path: String) throws {
    let representation = NSBitmapImageRep(cgImage: image)
    guard let data = representation.representation(using: .png, properties: [:]) else {
        throw AssetError.export(path)
    }
    do {
        try data.write(to: URL(fileURLWithPath: path), options: .atomic)
    } catch {
        throw AssetError.export(path)
    }
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
        throw AssetError.context
    }
    context.interpolationQuality = .high
    return context
}

func monochromeMark(from source: CGImage, red: UInt8, green: UInt8, blue: UInt8) throws -> CGImage {
    let width = source.width
    let height = source.height
    let context = try rgbaContext(width: width, height: height)
    context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height))

    guard let raw = context.data else { throw AssetError.context }
    let pixels = raw.bindMemory(to: UInt8.self, capacity: width * height * 4)
    for index in stride(from: 0, to: width * height * 4, by: 4) {
        let strength = max(pixels[index], max(pixels[index + 1], pixels[index + 2]))
        let alpha: UInt8
        if strength <= 72 {
            alpha = 0
        } else if strength >= 152 {
            alpha = 255
        } else {
            alpha = UInt8((Int(strength) - 72) * 255 / 80)
        }
        pixels[index] = UInt8(Int(red) * Int(alpha) / 255)
        pixels[index + 1] = UInt8(Int(green) * Int(alpha) / 255)
        pixels[index + 2] = UInt8(Int(blue) * Int(alpha) / 255)
        pixels[index + 3] = alpha
    }
    guard let output = context.makeImage() else { throw AssetError.context }
    return output
}

func resizedSocialCard(from source: CGImage) throws -> CGImage {
    let width = 1200
    let height = 630
    let context = try rgbaContext(width: width, height: height)
    context.draw(source, in: CGRect(x: 0, y: 0, width: width, height: height))
    guard let output = context.makeImage() else { throw AssetError.context }
    return output
}

do {
    guard CommandLine.arguments.count == 4 else { throw AssetError.usage }
    let logoPath = CommandLine.arguments[1]
    let socialSourcePath = CommandLine.arguments[2]
    let destination = URL(fileURLWithPath: CommandLine.arguments[3], isDirectory: true)
    try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)

    let logo = try loadCGImage(logoPath)
    let monoLight = try monochromeMark(from: logo, red: 255, green: 255, blue: 255)
    let monoDark = try monochromeMark(from: logo, red: 7, green: 20, blue: 34)
    try writePNG(monoLight, to: destination.appendingPathComponent("antigravity-a-orbital-mono-light.png").path)
    try writePNG(monoDark, to: destination.appendingPathComponent("antigravity-a-orbital-mono-dark.png").path)

    let socialSource = try loadCGImage(socialSourcePath)
    let socialCard = try resizedSocialCard(from: socialSource)
    try writePNG(socialCard, to: destination.appendingPathComponent("antigravity-social-card.png").path)
    print("Assets orbitais gerados: mono claro, mono escuro e cartão social 1200 × 630.")
} catch {
    FileHandle.standardError.write(Data("\(error)\n".utf8))
    exit(1)
}
