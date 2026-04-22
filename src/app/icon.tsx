import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0C",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            left: 156,
            top: 100,
            borderRadius: 100,
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 6,
            height: 240,
            left: 253,
            top: 136,
            borderRadius: 3,
            background: "rgba(255,255,255,0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 128,
            height: 128,
            left: 192,
            top: 264,
            transform: "rotate(45deg)",
            borderRadius: 28,
            background: "#0A0A0C",
            border: "10px solid rgba(255,255,255,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 128,
            height: 128,
            left: 192,
            top: 192,
            transform: "rotate(45deg)",
            borderRadius: 28,
            background: "#0A0A0C",
            border: "10px solid rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 128,
            height: 128,
            left: 192,
            top: 120,
            transform: "rotate(45deg)",
            borderRadius: 28,
            background: "#0A0A0C",
            border: "12px solid rgba(255,255,255,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            left: 240,
            top: 152,
            borderRadius: 16,
            background: "#fff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 50,
            height: 6,
            left: 186,
            top: 256,
            borderRadius: 3,
            background: "rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            left: 166,
            top: 253,
            borderRadius: 6,
            background: "rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 50,
            height: 6,
            left: 276,
            top: 328,
            borderRadius: 3,
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            left: 334,
            top: 325,
            borderRadius: 6,
            background: "rgba(255,255,255,0.2)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
