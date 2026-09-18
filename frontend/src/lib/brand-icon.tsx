/**
 * The Yarani TTS mark, drawn with plain flexbox so Satori (next/og) can
 * rasterize it at any size: a round dark disc with five audio bars, matching
 * the logo in the navbar.
 */
export function BrandIcon({ size }: { size: number }) {
  // Bar heights as fractions of the disc, mirroring lucide's `audio-lines`.
  const bars = [0.22, 0.42, 0.62, 0.36, 0.2];
  const barWidth = size * 0.085;
  const gap = size * 0.055;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "linear-gradient(145deg, #3f3f46 0%, #18181b 55%, #09090b 100%)",
        boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.02)}px rgba(255,255,255,0.08)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap,
          // Optical nudge: the tall middle bar reads centred when the whole
          // group sits a hair below true centre.
          marginTop: size * 0.01,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: barWidth,
              height: size * h,
              borderRadius: barWidth,
              background: "#fafafa",
            }}
          />
        ))}
      </div>
    </div>
  );
}
