"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type ImageResult = {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
};

type ApiResponse = {
  data?: ImageResult[];
  error?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  } | null;
};

const MODEL_OPTIONS = [
  { value: "gpt-image-2.5-sunburst", label: "GPT-Image-2.5 Sunburst" },
  { value: "gpt-image-2.5-flare", label: "GPT-Image-2.5 Flare" },
  { value: "gpt-image-2", label: "GPT-Image-2" },
];

const SIZE_OPTIONS = ["1024x1024", "1536x1024", "1024x1536", "1536x864", "864x1536", "2048x2048", "auto", "custom"];
const QUALITY_OPTIONS = ["auto", "low", "medium", "high", "xhigh", "max"];
const BG_OPTIONS = ["auto", "opaque", "transparent"];
const FORMAT_OPTIONS = ["png", "jpeg", "webp"];

const PROMPT_PRESETS = [
  "Create a premium product poster with dramatic studio lighting, clean typography space, highly detailed, photorealistic.",
  "Design a modern social media ad in 4:5 ratio style, bold headline area, luxury look, brand-ready composition.",
  "Generate a cinematic concept art scene with rich atmosphere, strong depth, elegant composition and refined detail.",
  "Edit the uploaded image while preserving the subject identity, improving the styling, lighting and polished commercial look.",
];

export default function HomePage() {
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [model, setModel] = useState("gpt-image-2.5-sunburst");
  const [prompt, setPrompt] = useState(PROMPT_PRESETS[0]);
  const [size, setSize] = useState("1024x1024");
  const [customSize, setCustomSize] = useState("1536x864");
  const [quality, setQuality] = useState("auto");
  const [background, setBackground] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("png");
  const [n, setN] = useState("1");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<ImageResult[]>([]);
  const [usage, setUsage] = useState<ApiResponse["usage"]>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chatgpt-image-studio-api-key");
    if (saved) {
      setApiKey(saved);
      setRememberKey(true);
    }
  }, []);

  useEffect(() => {
    if (rememberKey && apiKey.trim()) {
      localStorage.setItem("chatgpt-image-studio-api-key", apiKey.trim());
    } else {
      localStorage.removeItem("chatgpt-image-studio-api-key");
    }
  }, [rememberKey, apiKey]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const finalSize = useMemo(() => (size === "custom" ? customSize.trim() : size), [size, customSize]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []).slice(0, 4);
    setFiles(selected);
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const form = new FormData();
      form.append("apiKey", apiKey);
      form.append("model", model);
      form.append("prompt", prompt);
      form.append("size", finalSize);
      form.append("quality", quality);
      form.append("background", background);
      form.append("outputFormat", outputFormat);
      form.append("n", n);

      for (const file of files) {
        form.append("images", file);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      const payload: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate image.");
      }

      setImages(payload.data || []);
      setUsage(payload.usage || null);
      setSuccess(files.length > 0 ? "Reference-based generation completed successfully." : "Image generation completed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setImages([]);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setImages([]);
    setUsage(null);
    setError("");
    setSuccess("");
  }

  return (
    <main className="page">
      <div className="topbar">
        <div className="brand">
          <Image className="brandLogo" src="/bee-creative-hub.webp" alt="Bee Creative Hub" width={64} height={64} priority />
          <div className="brandText">
            <h1>AnhGPT Images</h1>
            <p>Powered by Bee Creative Hub · polished BYOK image generation UI for Vercel</p>
          </div>
        </div>

        <div className="topActions">
          <a className="ghostBtn" href="https://github.com/bizhang90/AnhGPT" target="_blank" rel="noreferrer">
            Target GitHub Repo
          </a>
          <div className="ghostBtn">Model-ready · Sunburst / Flare</div>
        </div>
      </div>

      <section className="hero">
        <div className="heroPanel">
          <div className="heroContent">
            <div className="overline">Creative image workstation · Bring your own OpenAI API key</div>
            <h2 className="heroTitle">
              Generate, edit, and refine visuals with <span className="highlight">GPT-Image 2.5</span> in a cleaner,
              more premium interface.
            </h2>
            <p className="heroText">
              This UI is designed for Vercel deployment and does not lock the API key in environment variables. Each user can paste their own key, choose Sunburst or Flare, upload references, and create polished visuals from one workspace.
            </p>
            <div className="badgeRow">
              <div className="badgePill">BYOK interface</div>
              <div className="badgePill">Beautiful dashboard layout</div>
              <div className="badgePill">Reference-image edit flow</div>
              <div className="badgePill">Ready for Bee Creative Hub branding</div>
            </div>
          </div>
        </div>

        <div className="statPanel">
          <div className="statCard">
            <strong>Best for precision</strong>
            <p>Sunburst is ideal when you need stronger edit fidelity, better reference retention, and cleaner commercial outputs.</p>
          </div>
          <div className="statCard">
            <strong>Best for speed</strong>
            <p>Flare is great for drafts, concepts, and rapid iterations before sending the final pass to Sunburst.</p>
          </div>
          <div className="statCard">
            <strong>Deploy pattern</strong>
            <p>Public UI + serverless route + user-supplied API key. Easy to extend with prompt history, presets, or billing later.</p>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="card">
          <div className="cardHeader">
            <h2>Generation controls</h2>
            <div className="sectionTag">Left panel</div>
          </div>

          <div className="form">
            <label className="label">
              <span>OpenAI API key</span>
              <input className="input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
            </label>

            <label className="toggleRow">
              <input type="checkbox" checked={rememberKey} onChange={(e) => setRememberKey(e.target.checked)} />
              <span className="helper">Store the API key only in this browser via localStorage</span>
            </label>

            <label className="label">
              <span>Prompt</span>
              <textarea className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </label>

            <div>
              <div className="helper" style={{ marginBottom: 8 }}>Quick prompt presets</div>
              <div className="chipRow">
                {PROMPT_PRESETS.map((preset) => (
                  <button key={preset} type="button" className="chip" onClick={() => setPrompt(preset)}>
                    {preset.length > 58 ? `${preset.slice(0, 58)}...` : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="row2">
              <label className="label">
                <span>Model</span>
                <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODEL_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Image count</span>
                <select className="select" value={n} onChange={(e) => setN(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </label>
            </div>

            <div className="row3">
              <label className="label">
                <span>Size</span>
                <select className="select" value={size} onChange={(e) => setSize(e.target.value)}>
                  {SIZE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Quality</span>
                <select className="select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                  {QUALITY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Background</span>
                <select className="select" value={background} onChange={(e) => setBackground(e.target.value)}>
                  {BG_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {size === "custom" && (
              <label className="label">
                <span>Custom size</span>
                <input className="input" value={customSize} onChange={(e) => setCustomSize(e.target.value)} placeholder="1536x864" />
              </label>
            )}

            <div className="row2">
              <label className="label">
                <span>Output format</span>
                <select className="select" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                  {FORMAT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Reference images (optional, max 4)</span>
                <input className="fileInput" type="file" accept="image/*" multiple onChange={onFileChange} />
              </label>
            </div>

            {previewUrls.length > 0 ? (
              <div className="previewStrip">
                {previewUrls.map((url, index) => (
                  <div className="previewItem" key={`${url}-${index}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="previewThumb" src={url} alt={`Reference ${index + 1}`} />
                    <div className="previewName">{files[index]?.name || `Reference ${index + 1}`}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="helper">
              No uploaded images = standard text-to-image. Uploaded images = reference/edit mode through the images edit endpoint.
            </div>

            <div className="buttonRow">
              <button className="button" onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate image"}
              </button>
              <button className="button secondary" onClick={clearAll} disabled={loading}>
                Clear results
              </button>
            </div>

            {error ? <div className="alert error">{error}</div> : null}
            {success ? <div className="alert success">{success}</div> : null}
          </div>
        </div>

        <div className="card resultsBox">
          <div className="cardHeader">
            <h2>Output gallery</h2>
            <div className="sectionTag">Right panel</div>
          </div>

          <div className="rightTop">
            <div className="infoCard">
              <h3>Workflow notes</h3>
              <div className="infoList">
                <div className="infoListItem">• Use <strong>Sunburst</strong> for final-quality brand visuals and edit precision.</div>
                <div className="infoListItem">• Use <strong>Flare</strong> for quick drafts, rough ideation, and faster iteration.</div>
                <div className="infoListItem">• For transparent output, pick <strong>background = transparent</strong> and format <strong>png/webp</strong>.</div>
                <div className="infoListItem">• Custom dimensions should follow OpenAI image size rules before sending the request.</div>
              </div>
            </div>

            <div className="metricGrid">
              <div className="metric">
                <strong>Current mode</strong>
                <span>{files.length > 0 ? "Reference edit / image-assisted" : "Text-to-image"}</span>
              </div>
              <div className="metric">
                <strong>Output size</strong>
                <span>{finalSize}</span>
              </div>
              <div className="metric">
                <strong>Usage</strong>
                <span>{usage ? `Input ${usage.input_tokens ?? 0} · Output ${usage.output_tokens ?? 0}` : "No usage yet"}</span>
              </div>
            </div>
          </div>

          <div className="resultsHeader">
            <h2>{images.length ? `Generated images (${images.length})` : "Waiting for output"}</h2>
            <div className="smallText">Preview, inspect, then download directly from the browser</div>
          </div>

          {images.length ? (
            <div className="gallery">
              {images.map((image, index) => {
                const src = image.b64_json ? `data:image/${outputFormat};base64,${image.b64_json}` : image.url || "";
                return (
                  <div key={index} className="imageCard">
                    <div className="imageWrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Generated ${index + 1}`} />
                    </div>
                    <div className="imageMeta">
                      <div className="smallText">Image {index + 1}</div>
                      <a className="downloadBtn" href={src} download={`anhgpt-image-${index + 1}.${outputFormat}`}>
                        Download
                      </a>
                    </div>
                    {image.revised_prompt ? <div className="revisedPrompt">{image.revised_prompt}</div> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="emptyState">
              <div>
                <h3>Your generated images will appear here</h3>
                <p>
                  Paste an API key, enter a prompt, optionally upload references, choose Sunburst or Flare, and run the job.
                  This layout is ready to be extended with prompt history, team presets, billing logic, or project-based asset storage.
                </p>
              </div>
            </div>
          )}

          <div className="footerNote">
            Security note: this version accepts user-supplied API keys in the interface and sends them only for the active request to the Vercel server route. Avoid logging secrets in production. The project uses a BYOK pattern: the API key is supplied by the user for each request and is not hard-coded into the deployment.
          </div>
        </div>
      </section>
    </main>
  );
}
