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
  { value: "gpt-image-2.5-sunburst", label: "GPT-Image-2.5 Sunburst · Chất lượng/độ chính xác" },
  { value: "gpt-image-2.5-flare", label: "GPT-Image-2.5 Flare · Tốc độ" },
  { value: "gpt-image-2", label: "GPT-Image-2" },
];

const SIZE_OPTIONS = [
  { value: "1024x1024", label: "Vuông 1:1 · 1024×1024" },
  { value: "1536x1024", label: "Ngang 3:2 · 1536×1024" },
  { value: "1024x1536", label: "Dọc 2:3 · 1024×1536" },
  { value: "1536x864", label: "Ngang 16:9 · 1536×864" },
  { value: "864x1536", label: "Dọc 9:16 · 864×1536" },
  { value: "2048x2048", label: "Vuông 2K · 2048×2048" },
  { value: "auto", label: "Tự động" },
  { value: "custom", label: "Tùy chỉnh" },
];

const QUALITY_OPTIONS = [
  { value: "auto", label: "Tự động" },
  { value: "low", label: "Thấp · nhanh" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "xhigh", label: "Rất cao" },
  { value: "max", label: "Tối đa" },
];

const BG_OPTIONS = [
  { value: "auto", label: "Tự động" },
  { value: "opaque", label: "Có nền" },
  { value: "transparent", label: "Trong suốt" },
];

const FORMAT_OPTIONS = ["png", "jpeg", "webp"];

const PROMPT_PRESETS = [
  "Tạo poster sản phẩm cao cấp với ánh sáng studio, bố cục sạch, có khoảng trống cho tiêu đề, hình ảnh chân thực và chi tiết cao.",
  "Thiết kế ảnh quảng cáo mạng xã hội tỷ lệ 4:5, tiêu đề nổi bật, phong cách hiện đại, sang trọng và phù hợp thương hiệu.",
  "Tạo khung cảnh điện ảnh giàu chiều sâu, ánh sáng đẹp, bố cục tinh tế và chi tiết sắc nét.",
  "Chỉnh sửa ảnh đã tải lên, giữ nguyên nhận diện chủ thể, cải thiện trang phục, ánh sáng và tổng thể theo hướng thương mại chuyên nghiệp.",
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
    const saved = localStorage.getItem("anhgpt-openai-api-key");
    if (saved) {
      setApiKey(saved);
      setRememberKey(true);
    }
  }, []);

  useEffect(() => {
    if (rememberKey && apiKey.trim()) {
      localStorage.setItem("anhgpt-openai-api-key", apiKey.trim());
    } else {
      localStorage.removeItem("anhgpt-openai-api-key");
    }
  }, [rememberKey, apiKey]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const finalSize = useMemo(
    () => (size === "custom" ? customSize.trim() : size),
    [size, customSize]
  );

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files || []).slice(0, 4));
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
      files.forEach((file) => form.append("images", file));

      const response = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });
      const payload: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Không thể tạo ảnh.");
      }

      setImages(payload.data || []);
      setUsage(payload.usage || null);
      setSuccess(
        files.length > 0
          ? "Đã tạo/chỉnh ảnh thành công từ ảnh tham chiếu."
          : "Đã tạo ảnh thành công."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
      setImages([]);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setImages([]);
    setUsage(null);
    setError("");
    setSuccess("");
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <Image
            className="brandLogo"
            src="/bee-creative-hub.webp"
            alt="Bee Creative Hub"
            width={150}
            height={92}
            priority
          />
          <div className="brandText">
            <h1>Trình tạo ảnh bằng ChatGPT</h1>
            <p>Bee Creative Hub · Tạo và chỉnh sửa hình ảnh bằng ChatGPT</p>
          </div>
        </div>
        <div className="topActions">
          <div className="ghostBtn">Sunburst · Flare · Tự dùng khóa API</div>
        </div>
      </header>

      <section className="hero">
        <div className="heroPanel">
          <div className="heroContent">
            <div className="overline">Xưởng sáng tạo hình ảnh · Tự nhập khóa API OpenAI</div>
            <h2 className="heroTitle">
              Tạo và chỉnh sửa hình ảnh với <span className="highlight">GPT-Image 2.5</span>
            </h2>
            <p className="heroText">
              Không cần gắn cứng API key trên Vercel. Mỗi người dùng tự nhập khóa của mình,
              chọn mô hình, kích thước, chất lượng và ảnh tham chiếu rồi tạo ảnh ngay trên một giao diện duy nhất.
            </p>
            <div className="badgeRow">
              <div className="badgePill">Tự dùng khóa API</div>
              <div className="badgePill">Tạo ảnh từ mô tả</div>
              <div className="badgePill">Chỉnh sửa bằng ảnh tham chiếu</div>
              <div className="badgePill">Tải ảnh trực tiếp</div>
            </div>
          </div>
        </div>

        <div className="statPanel">
          <div className="statCard">
            <strong>Sunburst · ưu tiên chất lượng</strong>
            <p>Phù hợp ảnh final, yêu cầu bám ảnh tham chiếu và chỉnh sửa chính xác.</p>
          </div>
          <div className="statCard">
            <strong>Flare · ưu tiên tốc độ</strong>
            <p>Phù hợp dựng nháp, thử ý tưởng và tạo nhanh nhiều phương án.</p>
          </div>
          <div className="statCard">
            <strong>API theo từng người dùng</strong>
            <p>Khóa API được nhập tại giao diện, không cần cấu hình cố định trong Vercel.</p>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="card">
          <div className="cardHeader">
            <h2>Thiết lập tạo ảnh</h2>
            <div className="sectionTag">Điều khiển</div>
          </div>

          <div className="form">
            <label className="label">
              <span>Khóa API OpenAI</span>
              <input
                className="input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>

            <label className="toggleRow">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
              />
              <span className="helper">Ghi nhớ khóa API trên trình duyệt này</span>
            </label>

            <label className="label">
              <span>Mô tả hình ảnh / Prompt</span>
              <textarea
                className="textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả thật cụ thể hình ảnh anh muốn tạo..."
              />
            </label>

            <div>
              <div className="helper" style={{ marginBottom: 8 }}>Mẫu mô tả nhanh</div>
              <div className="chipRow">
                {PROMPT_PRESETS.map((preset) => (
                  <button key={preset} type="button" className="chip" onClick={() => setPrompt(preset)}>
                    {preset.length > 55 ? `${preset.slice(0, 55)}...` : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="row2">
              <label className="label">
                <span>Mô hình</span>
                <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
                  {MODEL_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Số lượng ảnh</span>
                <select className="select" value={n} onChange={(e) => setN(e.target.value)}>
                  <option value="1">1 ảnh</option>
                  <option value="2">2 ảnh</option>
                  <option value="3">3 ảnh</option>
                  <option value="4">4 ảnh</option>
                </select>
              </label>
            </div>

            <div className="row3">
              <label className="label">
                <span>Kích thước</span>
                <select className="select" value={size} onChange={(e) => setSize(e.target.value)}>
                  {SIZE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Chất lượng</span>
                <select className="select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                  {QUALITY_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Kiểu nền</span>
                <select className="select" value={background} onChange={(e) => setBackground(e.target.value)}>
                  {BG_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {size === "custom" && (
              <label className="label">
                <span>Kích thước tùy chỉnh</span>
                <input
                  className="input"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Ví dụ: 1536x864"
                />
              </label>
            )}

            <div className="row2">
              <label className="label">
                <span>Định dạng ảnh</span>
                <select className="select" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                  {FORMAT_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item.toUpperCase()}</option>
                  ))}
                </select>
              </label>

              <label className="label">
                <span>Ảnh tham chiếu · tối đa 4 ảnh</span>
                <input className="fileInput" type="file" accept="image/*" multiple onChange={onFileChange} />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="previewStrip">
                {previewUrls.map((url, index) => (
                  <div className="previewItem" key={`${url}-${index}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="previewThumb" src={url} alt={`Ảnh tham chiếu ${index + 1}`} />
                    <div className="previewName">{files[index]?.name || `Ảnh ${index + 1}`}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="helper">
              Không tải ảnh: tạo ảnh mới từ mô tả. Có tải ảnh: dùng ảnh làm tham chiếu/chỉnh sửa.
            </div>

            <div className="buttonRow">
              <button className="button" onClick={handleGenerate} disabled={loading}>
                {loading ? "Đang tạo ảnh..." : "Tạo ảnh ngay"}
              </button>
              <button className="button secondary" onClick={clearResults} disabled={loading}>
                Xóa kết quả
              </button>
            </div>

            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}
          </div>
        </div>

        <div className="card resultsBox">
          <div className="cardHeader">
            <h2>Kết quả tạo ảnh</h2>
            <div className="sectionTag">Xem trước & tải xuống</div>
          </div>

          <div className="rightTop">
            <div className="infoCard">
              <h3>Gợi ý sử dụng</h3>
              <div className="infoList">
                <div className="infoListItem">• Chọn <strong>Sunburst</strong> khi cần ảnh final hoặc chỉnh sửa chính xác.</div>
                <div className="infoListItem">• Chọn <strong>Flare</strong> khi cần thử nhanh nhiều ý tưởng.</div>
                <div className="infoListItem">• Muốn nền trong suốt: chọn <strong>Trong suốt</strong> và định dạng PNG/WebP.</div>
                <div className="infoListItem">• Có thể tải tối đa 4 ảnh tham chiếu cho một lần tạo.</div>
              </div>
            </div>

            <div className="metricGrid">
              <div className="metric">
                <strong>Chế độ hiện tại</strong>
                <span>{files.length > 0 ? "Dùng ảnh tham chiếu" : "Tạo ảnh từ mô tả"}</span>
              </div>
              <div className="metric">
                <strong>Kích thước đầu ra</strong>
                <span>{finalSize === "auto" ? "Tự động" : finalSize}</span>
              </div>
              <div className="metric">
                <strong>Mức sử dụng</strong>
                <span>
                  {usage
                    ? `Đầu vào ${usage.input_tokens ?? 0} · Đầu ra ${usage.output_tokens ?? 0}`
                    : "Chưa có dữ liệu"}
                </span>
              </div>
            </div>
          </div>

          <div className="resultsHeader">
            <h2>{images.length ? `Ảnh đã tạo (${images.length})` : "Chưa có ảnh"}</h2>
            <div className="smallText">Ảnh mới sẽ xuất hiện tại khu vực này</div>
          </div>

          {images.length ? (
            <div className="gallery">
              {images.map((image, index) => {
                const src = image.b64_json
                  ? `data:image/${outputFormat};base64,${image.b64_json}`
                  : image.url || "";

                return (
                  <div key={index} className="imageCard">
                    <div className="imageWrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Ảnh đã tạo ${index + 1}`} />
                    </div>
                    <div className="imageMeta">
                      <div className="smallText">Ảnh {index + 1}</div>
                      <a className="downloadBtn" href={src} download={`chatgpt-image-${index + 1}.${outputFormat}`}>
                        Tải xuống
                      </a>
                    </div>
                    {image.revised_prompt && <div className="revisedPrompt">{image.revised_prompt}</div>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="emptyState">
              <div>
                <h3>Sẵn sàng tạo ảnh</h3>
                <p>
                  Nhập khóa API, viết mô tả, chọn mô hình và các thiết lập ở bên trái rồi bấm “Tạo ảnh ngay”.
                  Nếu cần bám nhân vật, sản phẩm hoặc phong cách có sẵn, hãy tải ảnh tham chiếu trước khi tạo.
                </p>
              </div>
            </div>
          )}

          <div className="footerNote">
            Bảo mật: khóa API chỉ được gửi theo yêu cầu tạo ảnh hiện tại. Chỉ bật “Ghi nhớ khóa API” trên thiết bị cá nhân đáng tin cậy.
          </div>
        </div>
      </section>
    </main>
  );
}
