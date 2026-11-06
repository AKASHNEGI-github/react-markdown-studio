/** Share-link encoding for the playground: the document travels in the URL, so there is no server and nothing is stored. */

const MAX_ENCODED_LENGTH = 7000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const padded = text
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes.slice()]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

/** "z…" = deflate-compressed, "p…" = plain (for browsers without CompressionStream). Returns null if too long to share. */
export async function encodeDocument(text: string): Promise<string | null> {
  const bytes = new TextEncoder().encode(text);
  const encoded =
    typeof CompressionStream === "function"
      ? "z" + toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")))
      : "p" + toBase64Url(bytes);
  return encoded.length <= MAX_ENCODED_LENGTH ? encoded : null;
}

export async function decodeDocument(encoded: string): Promise<string | null> {
  try {
    const bytes = fromBase64Url(encoded.slice(1));
    if (encoded[0] === "p") return new TextDecoder().decode(bytes);
    if (encoded[0] === "z" && typeof DecompressionStream === "function") {
      return new TextDecoder().decode(await pipe(bytes, new DecompressionStream("deflate-raw")));
    }
  } catch {
    /* malformed link: ignore */
  }
  return null;
}
