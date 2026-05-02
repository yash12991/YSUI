type ZipFile = {
  path: string
  content: string | Uint8Array
}

const encoder = new TextEncoder()
const crcTable = new Uint32Array(256)

for (let i = 0; i < 256; i += 1) {
  let c = i
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[i] = c >>> 0
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff
  buffer[offset + 1] = (value >>> 8) & 0xff
}

function writeUint32(buffer: Uint8Array, offset: number, value: number) {
  buffer[offset] = value & 0xff
  buffer[offset + 1] = (value >>> 8) & 0xff
  buffer[offset + 2] = (value >>> 16) & 0xff
  buffer[offset + 3] = (value >>> 24) & 0xff
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function normalizePath(path: string) {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\./g, '').trim()
}

export function createZip(files: ZipFile[]) {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const path = normalizePath(file.path)
    if (!path) continue

    const name = encoder.encode(path)
    const content = typeof file.content === 'string' ? encoder.encode(file.content) : file.content
    const checksum = crc32(content)

    const local = new Uint8Array(30 + name.length + content.length)
    writeUint32(local, 0, 0x04034b50)
    writeUint16(local, 4, 20)
    writeUint16(local, 6, 0x0800)
    writeUint16(local, 8, 0)
    writeUint16(local, 10, 0)
    writeUint16(local, 12, 0)
    writeUint32(local, 14, checksum)
    writeUint32(local, 18, content.length)
    writeUint32(local, 22, content.length)
    writeUint16(local, 26, name.length)
    writeUint16(local, 28, 0)
    local.set(name, 30)
    local.set(content, 30 + name.length)
    localParts.push(local)

    const central = new Uint8Array(46 + name.length)
    writeUint32(central, 0, 0x02014b50)
    writeUint16(central, 4, 20)
    writeUint16(central, 6, 20)
    writeUint16(central, 8, 0x0800)
    writeUint16(central, 10, 0)
    writeUint16(central, 12, 0)
    writeUint16(central, 14, 0)
    writeUint32(central, 16, checksum)
    writeUint32(central, 20, content.length)
    writeUint32(central, 24, content.length)
    writeUint16(central, 28, name.length)
    writeUint16(central, 30, 0)
    writeUint16(central, 32, 0)
    writeUint16(central, 34, 0)
    writeUint16(central, 36, 0)
    writeUint32(central, 38, 0)
    writeUint32(central, 42, offset)
    central.set(name, 46)
    centralParts.push(central)

    offset += local.length
  }

  const central = concat(centralParts)
  const end = new Uint8Array(22)
  writeUint32(end, 0, 0x06054b50)
  writeUint16(end, 8, centralParts.length)
  writeUint16(end, 10, centralParts.length)
  writeUint32(end, 12, central.length)
  writeUint32(end, 16, offset)
  writeUint16(end, 20, 0)

  return concat([...localParts, central, end])
}
