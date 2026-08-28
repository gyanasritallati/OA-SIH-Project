import { useState, useEffect } from 'react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://koa-backend-ygct.onrender.com'

/* ---------- Background: moving waves + subtle pulse rings ---------- */
const BgCanvas = () => (
  <div className="bg-canvas" aria-hidden="true">
    <div className="bg-grid" />

    <div className="pulse-ring pulse-ring-1" />
    <div className="pulse-ring pulse-ring-2" />
    <div className="pulse-ring pulse-ring-3" />

    <svg
      className="wave-layer"
      style={{ bottom: '0', height: '38vh' }}
      viewBox="0 0 2880 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wv1g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="50%" stopColor="var(--accent-1)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <path
        d="M0,160 C360,80 720,240 1080,160 C1440,80 1800,240 2160,160 C2520,80 2700,200 2880,160 L2880,320 L0,320 Z"
        fill="url(#wv1g)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,0"
          to="-1440,0"
          dur="18s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    <svg
      className="wave-layer"
      style={{ bottom: '0', height: '28vh' }}
      viewBox="0 0 2880 260"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wv2g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.22" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <path
        d="M0,130 C480,40 960,220 1440,130 C1920,40 2400,200 2880,130 L2880,260 L0,260 Z"
        fill="url(#wv2g)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-1440,0"
          to="0,0"
          dur="12s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    <svg
      className="wave-layer"
      style={{ bottom: '0', height: '18vh' }}
      viewBox="0 0 2880 200"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wv3g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.20" />
          <stop offset="50%" stopColor="var(--accent-2)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.20" />
        </linearGradient>
      </defs>

      <path
        d="M0,100 C240,40 480,160 720,100 C960,40 1200,150 1440,100 C1680,50 1920,150 2160,100 C2400,50 2640,140 2880,100 L2880,200 L0,200 Z"
        fill="url(#wv3g)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="0,0"
          to="-1440,0"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    <svg
      className="wave-layer"
      style={{ top: '0', height: '14vh' }}
      viewBox="0 0 2880 160"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,80 C360,130 720,30 1080,80 C1440,130 1800,30 2160,80 C2520,130 2700,50 2880,80 L2880,0 L0,0 Z"
        fill="var(--primary)"
        fillOpacity="0.08"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          from="-1440,0"
          to="0,0"
          dur="22s"
          repeatCount="indefinite"
        />
      </path>
    </svg>

    <div className="scanlines" />
  </div>
)

function App() {
  const [theme, setTheme] = useState('light')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  /* Sync theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  /* ---------- Video change ---------- */
  const handleVideoChange = (event) => {
    const file = event.target.files[0]

    if (!file) return

    const MAX_SIZE = 50 * 1024 * 1024

    if (file.size > MAX_SIZE) {
      setSelectedVideo(null)
      setVideoUrl(null)
      setResult(null)
      setError(
        'Video is too large. Please select a video smaller than 50 MB.'
      )
      return
    }

    setSelectedVideo(file)
    setVideoUrl(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  /* ---------- Analyze ---------- */
  const handleAnalyze = async () => {
    if (!selectedVideo) return

    setAnalyzing(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('video', selectedVideo)

    try {
      console.log('🎥 Sending video to:', API_URL)

      const response = await fetch(`${API_URL}/extract-pose`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      console.log('📊 Result:', data)

      if (!response.ok || !data.success) {
        throw new Error(
          data.detail ||
          data.error ||
          'Video analysis failed'
        )
      }

      setResult(data)
    } catch (err) {
      console.error('❌ Analysis error:', err)
      console.error('Error name:', err.name)
      console.error('Error message:', err.message)

      setError(
        err.message ||
        'Could not connect to the backend.'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  /* ---------- Download PDF ---------- */
  const downloadPDF = async () => {
    if (!result) return

    try {
      console.log('📄 Generating PDF...')

      const response = await fetch(`${API_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      })

      console.log('📥 PDF response:', response.status)

      if (!response.ok) {
        let errorMessage = 'PDF generation failed'

        try {
          const errorData = await response.json()

          errorMessage =
            errorData.detail ||
            errorData.error ||
            errorMessage
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = url
      link.download = 'OA_Screening_Report.pdf'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)

      console.log('✅ PDF downloaded successfully')
    } catch (err) {
      console.error('❌ PDF error:', err)

      setError(
        err.message ||
        'Could not generate PDF report.'
      )
    }
  }

  /* ---------- Download CSV ---------- */
  const downloadCSV = () => {
    if (!result) return

    const prediction = result.prediction

    let csv = 'OA Risk Analysis Report\n\n'

    csv += 'Risk Score,'
    csv += `${(prediction.risk * 100).toFixed(1)}%\n`

    csv += 'Risk Band,'
    csv += `${prediction.band}\n`

    if (prediction.stage) {
      csv += 'Severity Grade,'
      csv += `${prediction.stage.grade}\n`

      csv += 'Confidence,'
      csv += `"${prediction.stage.confidence}"\n`
    }

    csv += '\nGait Measurements\n'
    csv += 'Measurement,Value,Unit,Reading\n'

    if (prediction.measurements) {
      prediction.measurements.forEach((measurement) => {
        csv += `"${measurement.label}",`
        csv += `"${measurement.value}",`
        csv += `"${measurement.unit}",`
        csv += `"${measurement.reading}"\n`
      })
    }

    csv += '\nAnalysis Information\n'
    csv += `Frames Processed,${result.frames_processed}\n`
    csv += `Frames Detected,${result.frames_detected}\n`

    csv += '\nDisclaimer\n'
    csv += '"AI-assisted screening result. Not a medical diagnosis."\n'

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'OA_Analysis_Report.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const band = result?.prediction?.band ?? 'low'

  return (
    <div className="app">

      {/* Animated Background */}
      <BgCanvas />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">OA</div>

          <div className="logo-text">
            <h2>OA Risk AI</h2>
            <p>Gait Analysis System</p>
          </div>
        </div>

        <div className="header-right">
          <span className="header-text">
            AI-Powered KOA Screening
          </span>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className="theme-toggle-knob">
              {theme === 'light' ? '☀️' : '🌙'}
            </div>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">

        {/* Hero */}
        <section className="hero-section">
          <div className="badge">
            <span className="badge-dot" />
            AI-Powered Gait Analysis
          </div>

          <h1>
            Detect{' '}
            <span className="grad-text">
              Osteoarthritis Risk
            </span>
            <br />
            from a Walking Video
          </h1>

          <p className="subtitle">
            Upload a short walking video and our AI analyzes gait
            patterns, extracts biomechanical features, and estimates
            your knee OA risk — in seconds.
          </p>
        </section>

        {/* Upload Card */}
        <section className="glass-card upload-card">

          {!selectedVideo ? (
            <label className="upload-area">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: 'none' }}
              />

              <div className="upload-icon">🎥</div>

              <h3>Drop your video here</h3>

              <p>
                or click to browse files — max 50 MB
              </p>

              <span className="file-types">
                MP4 · MOV · AVI · MKV · WEBM
              </span>
            </label>
          ) : (
            <div className="video-section">

              <video
                className="video-preview"
                controls
                src={videoUrl}
              >
                Your browser does not support video.
              </video>

              <div className="file-info">

                <div className="file-info-text">
                  <h3>{selectedVideo.name}</h3>

                  <p>
                    {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <label className="change-video">
                  ↺ Change Video

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </label>

              </div>
            </div>
          )}

          <button
            className="analyze-button"
            disabled={!selectedVideo || analyzing}
            onClick={handleAnalyze}
          >
            {analyzing ? (
              <>
                <div className="spinner" />
                Analyzing gait patterns…
              </>
            ) : (
              '⚡ Analyze Video'
            )}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </section>

        {/* Results */}
        {result && result.prediction && (
          <section
            className={`glass-card results-card risk-${band}`}
          >

            <div className="report-header">

              <span className="badge">
                <span className="badge-dot" />
                Analysis Complete
              </span>

              <h2>OA Risk Analysis Report</h2>

              <p>
                Generated from gait analysis ·{' '}
                {result.frames_detected} of{' '}
                {result.frames_processed} frames with pose detected
              </p>

            </div>

            {/* Metrics */}
            <div className="dashboard-grid">

              <div className={`metric-card risk-${band}`}>
                <h3>OA Risk Score</h3>

                <div className="risk-ring-wrap">
                  <div className="risk-circle">
                    {(result.prediction.risk * 100).toFixed(1)}%
                  </div>
                </div>

                <span className="risk-band">
                  {band}
                </span>
              </div>

              {result.prediction.stage && (
                <div className="metric-card">

                  <h3>Severity Grade</h3>

                  <div className="severity-grade">
                    {result.prediction.stage.grade}
                  </div>

                  <p className="severity-conf">
                    {result.prediction.stage.confidence}
                  </p>

                </div>
              )}

            </div>

            {/* Measurements */}
            {result.prediction.measurements?.length > 0 && (
              <div className="measurements">

                <h3>Gait Measurements</h3>

                <div className="measurement-grid">

                  {result.prediction.measurements.map(
                    (measurement, index) => (
                      <div
                        className="measurement"
                        key={index}
                      >
                        <div className="measurement-header">

                          <span className="measurement-label">
                            {measurement.label}
                          </span>

                          <span className="measurement-value">
                            {measurement.value}{' '}
                            {measurement.unit}
                          </span>

                        </div>

                        <div className="measurement-reading">
                          {measurement.reading}
                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* Analysis Information */}
            <div className="analysis-info">

              <h3>Analysis Information</h3>

              <p>
                <strong>Frames processed:</strong>{' '}
                {result.frames_processed}
              </p>

              <p>
                <strong>Frames detected:</strong>{' '}
                {result.frames_detected}
              </p>

              <p>
                <strong>Pose extraction:</strong>{' '}
                Completed
              </p>

              <p>
                <strong>KOA prediction:</strong>{' '}
                Completed
              </p>

            </div>

            {/* Actions */}
            <div className="report-actions">

              <button
                className="download-button"
                onClick={downloadPDF}
                disabled={!result}
              >
                📄 Download PDF
              </button>

              <button
                className="download-button"
                onClick={downloadCSV}
                disabled={!result}
              >
                📊 Download CSV
              </button>

            </div>

            <p className="disclaimer">
              ⚠️ AI-assisted screening only. Not a medical diagnosis.
              Consult a qualified physician.
            </p>

          </section>
        )}

        {/* How It Works */}
        <section className="steps-section">

          {[
            {
              n: 1,
              title: 'Upload',
              desc: 'Drop or select a clear side-view walking video of the patient.',
            },
            {
              n: 2,
              title: 'Extract',
              desc: 'MediaPipe extracts 3D pose landmarks from every frame of the video.',
            },
            {
              n: 3,
              title: 'Predict',
              desc: 'AI computes biomechanical features and runs the KOA risk model.',
            },
            {
              n: 4,
              title: 'Report',
              desc: 'Download a detailed PDF or CSV report with measurements.',
            },
          ].map((step) => (
            <div className="step" key={step.n}>

              <div className="step-number">
                {step.n}
              </div>

              <h3>{step.title}</h3>

              <p>{step.desc}</p>

            </div>
          ))}

        </section>

      </main>

      <footer>
        <p>
          KOA Screener — AI-assisted research tool.
          Not a substitute for medical advice.
        </p>
      </footer>

    </div>
  )
}

export default App