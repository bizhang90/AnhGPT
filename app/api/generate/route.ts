import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENAI_IMAGE_GENERATE_URL = "https://api.openai.com/v1/images/generations";
const OPENAI_IMAGE_EDIT_URL = "https://api.openai.com/v1/images/edits";

function clean(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

function isValidCustomSize(size: string) {
  if (size === "auto") return true;
  const match = size.match(/^(\d+)x(\d+)$/i);
  if (!match) return false;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false;
  if (width % 16 !== 0 || height % 16 !== 0) return false;
  if (width > 3840 || height > 3840) return false;

  const ratio = width / height;
  if (ratio < 1 / 3 || ratio > 3) return false;

  const totalPixels = width * height;
  if (totalPixels < 655_360 || totalPixels > 8_294_400) return false;

  return true;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const apiKey = clean(formData.get("apiKey"));
    const prompt = clean(formData.get("prompt"));
    const model = clean(formData.get("model"), "gpt-image-2.5-sunburst");
    const size = clean(formData.get("size"), "1024x1024");
    const quality = clean(formData.get("quality"), "auto");
    const background = clean(formData.get("background"), "auto");
    const outputFormat = clean(formData.get("outputFormat"), "png");
    const n = Number(clean(formData.get("n"), "1"));

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key." }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (!isValidCustomSize(size)) {
      return NextResponse.json(
        {
          error:
            "Invalid size. Use auto or WIDTHxHEIGHT. Width/height must be multiples of 16, each edge <= 3840, total pixels between 655,360 and 8,294,400, and aspect ratio between 1:3 and 3:1.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(n) || n < 1 || n > 4) {
      return NextResponse.json({ error: "n must be between 1 and 4." }, { status: 400 });
    }

    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);

    let upstreamResponse: Response;

    if (files.length > 0) {
      const upstreamForm = new FormData();
      upstreamForm.append("model", model);
      upstreamForm.append("prompt", prompt);
      upstreamForm.append("size", size);
      upstreamForm.append("quality", quality);
      upstreamForm.append("background", background);
      upstreamForm.append("output_format", outputFormat);
      upstreamForm.append("n", String(n));

      for (const file of files) {
        upstreamForm.append("image", file, file.name || "reference.png");
      }

      upstreamResponse = await fetch(OPENAI_IMAGE_EDIT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: upstreamForm,
        cache: "no-store",
      });
    } else {
      upstreamResponse = await fetch(OPENAI_IMAGE_GENERATE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          size,
          quality,
          background,
          output_format: outputFormat,
          n,
        }),
        cache: "no-store",
      });
    }

    const data = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      const message = data?.error?.message || "OpenAI request failed.";
      return NextResponse.json({ error: message, raw: data }, { status: upstreamResponse.status });
    }

    return NextResponse.json({
      created: Date.now(),
      data: data?.data || [],
      usage: data?.usage || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
