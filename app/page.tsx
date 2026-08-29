/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Github,
  Globe2,
  Menu,
  Radio,
  ShieldCheck,
  Ship,
  Snowflake,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import dashboardOverview from "../assets/Screenshot 2026-08-26 224729.png";
import vesselMap from "../assets/Screenshot 2026-08-26 224832.png";
import vesselLog from "../assets/Screenshot 2026-08-26 224905.png";
import analytics from "../assets/Screenshot 2026-08-26 224940.png";

const features = [
  {
    number: "01",
    icon: Ship,
    title: "Live vessel intelligence",
    description:
      "Follow AIS-reporting vessels across Finnish waters with heading, speed, destination and vessel metadata in one operational view.",
  },
  {
    number: "02",
    icon: Waves,
    title: "Port activity",
    description:
      "Move from the fleet picture to port-level traffic, incoming vessels and location intelligence without leaving the platform.",
  },
  {
    number: "03",
    icon: Snowflake,
    title: "Icebreaker operations",
    description:
      "Surface winter-navigation vessels and operational activity for a clearer picture of Arctic maritime movement.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Fleet analytics",
    description:
      "Turn raw AIS and port-call feeds into speed, utilization and fleet-level signals that are easier to understand.",
  },
];

const architecture = [
  ["Next.js 16", "App Router + Route Handlers"],
  ["React 19", "Interactive product UI"],
  ["TypeScript", "Typed application layer"],
  ["MapLibre GL JS", "High-density geospatial rendering"],
  ["TanStack Query", "Client caching + synchronization"],
  ["Recharts", "Fleet analytics visualization"],
];

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`fmi-reveal ${className}`}>{children}</div>;
}

function LoadingScreen({ done }: { done: boolean }) {
  return (
    <div
      aria-hidden={done}
      className={`fmi-loader ${done ? "fmi-loader--done" : ""}`}
    >
      <div className="fmi-loader__grid" />
      <div className="fmi-loader__content">
        <div className="fmi-loader__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="fmi-loader__eyebrow">F.M.I. / SYSTEM INITIALIZATION</p>
        <h1>FINNISH MARITIME INTELLIGENCE</h1>
        <div className="fmi-loader__status">
          <span className="fmi-live-dot" />
          <span>Preparing intelligence interface</span>
        </div>
        <div className="fmi-loader__line">
          <span />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const images = Array.from(document.images).filter((image) => image.dataset.critical === "true");
    const imagePromises = images.map(
      (image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
    );

    const fontsReady =
      "fonts" in document ? document.fonts.ready : Promise.resolve();

    Promise.all([fontsReady, ...imagePromises]).then(() => {
      if (!cancelled) {
        requestAnimationFrame(() => setReady(true));
      }
    });

    const fallback = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 7000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = ready ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <LoadingScreen done={ready} />

      <div className="fmi-site">
        <a className="fmi-skip-link" href="#main-content">
          Skip to main content
        </a>

        <header className="fmi-nav">
          <div className="fmi-container fmi-nav__inner">
            <Link href="/" className="fmi-brand" aria-label="FMI home">
              <span className="fmi-brand__signal" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>
                <strong>F.M.I.</strong>
                <small>FINNISH MARITIME INTELLIGENCE</small>
              </span>
            </Link>

            <nav className="fmi-nav__links" aria-label="Primary navigation">
              <a href="#intelligence">Intelligence</a>
              <a href="#engineering">Engineering</a>
              <a href="#data">Data</a>
            </nav>

            <div className="fmi-nav__actions">
              <a
                href="https://github.com/Djsteplion/Finnish-Maritime-Intelligence"
                target="_blank"
                rel="noreferrer"
                className="fmi-icon-link"
                aria-label="View Finnish Maritime Intelligence source code on GitHub"
              >
                <Github size={18} aria-hidden="true" />
              </a>
              <Link href="/ui/dashboard" className="fmi-button fmi-button--small">
                Open dashboard <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <button
              type="button"
              className="fmi-menu-button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          <div
            id="mobile-navigation"
            className={`fmi-mobile-nav ${menuOpen ? "fmi-mobile-nav--open" : ""}`}
            aria-hidden={!menuOpen}
            inert={!menuOpen ? true : undefined}
          >
            <a href="#intelligence" onClick={closeMenu}>Intelligence</a>
            <a href="#engineering" onClick={closeMenu}>Engineering</a>
            <a href="#data" onClick={closeMenu}>Data</a>
            <Link href="/ui/dashboard" onClick={closeMenu}>
              Open dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <main id="main-content">
          <section className="fmi-hero">
            <div className="fmi-hero__glow" aria-hidden="true" />
            <div className="fmi-container fmi-hero__inner">
              <Reveal>
                <div className="fmi-kicker">
                  <span className="fmi-live-dot" />
                  LIVE MARITIME DATA / FINLAND
                </div>
              </Reveal>

              <Reveal className="fmi-hero__title-wrap">
                <h1>
                  Real-time
                  <span> intelligence</span>
                  <br />
                  for Finnish waters.
                </h1>
              </Reveal>

              <Reveal>
                <p className="fmi-hero__copy">
                  A geospatial maritime intelligence platform built around live
                  AIS data. Track vessels, ports, icebreaker operations and
                  fleet behavior through one operational interface.
                </p>
              </Reveal>

              <Reveal className="fmi-hero__actions">
                <Link href="/ui/dashboard" className="fmi-button">
                  Explore live dashboard
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href="#intelligence" className="fmi-button fmi-button--ghost">
                  See how it works
                  <ArrowDownRight size={17} aria-hidden="true" />
                </a>
              </Reveal>

              <Reveal className="fmi-hero__proof">
                <div><strong>LIVE AIS</strong><span>Vessel positions</span></div>
                <div><strong>MAPLIBRE</strong><span>Geospatial rendering</span></div>
                <div><strong>~30s</strong><span>Position refresh cycle</span></div>
              </Reveal>

              <Reveal className="fmi-device">
                <div className="fmi-device__bar">
                  <span className="fmi-device__dots" aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  <span>FMI / FLEET OVERVIEW</span>
                  <span className="fmi-device__live"><span className="fmi-live-dot" /> LIVE</span>
                </div>
                <div className="fmi-device__screen">
                  <Image
                    src={dashboardOverview}
                    alt="Finnish Maritime Intelligence fleet overview showing vessel statistics and a live maritime map"
                    priority
                    sizes="(max-width: 768px) 94vw, 1200px"
                    className="fmi-dashboard-image"
                    data-critical="true"
                  />
                </div>
              </Reveal>
            </div>
          </section>

          <section id="intelligence" className="fmi-section fmi-section--light">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-section-head">
                  <div>
                    <span className="fmi-section-label">01 / INTELLIGENCE</span>
                    <h2>From raw movement to an operational picture.</h2>
                  </div>
                  <p>
                    The interface is designed around the questions an operator
                    actually needs answered: what is moving, where is it going,
                    what is happening at the ports, and what is changing.
                  </p>
                </div>
              </Reveal>

              <div className="fmi-feature-grid">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Reveal key={feature.number} className={`fmi-feature fmi-delay-${index + 1}`}>
                      <div className="fmi-feature__top">
                        <span>{feature.number}</span>
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                      <span className="fmi-feature__line" aria-hidden="true" />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="fmi-section fmi-section--dark fmi-map-story">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-split">
                  <div>
                    <span className="fmi-section-label fmi-section-label--blue">02 / LIVE MAP</span>
                    <h2>Thousands of signals. One map.</h2>
                  </div>
                  <p>
                    Vessel positions are rendered as a reusable MapLibre symbol
                    layer rather than hundreds of DOM markers. Heading and
                    zoom behavior are handled by map expressions for a denser,
                    more responsive fleet view.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="fmi-image-card">
                  <Image
                    src={vesselMap}
                    alt="FMI live vessel map with selected vessel detail panel"
                    sizes="(max-width: 768px) 94vw, 1200px"
                    className="fmi-story-image"
                  />
                  <div className="fmi-image-card__caption">
                    <span><span className="fmi-live-dot" /> LIVE FLEET VIEW</span>
                    <span>MAPLIBRE GL JS</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="engineering" className="fmi-section fmi-section--dark fmi-engineering">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-section-head fmi-section-head--dark">
                  <div>
                    <span className="fmi-section-label fmi-section-label--blue">03 / ENGINEERING</span>
                    <h2>Built for real data, not mock JSON.</h2>
                  </div>
                  <p>
                    The interesting part is underneath the interface: server-side
                    aggregation, independent caching lifetimes and a rendering
                    strategy designed for high-density AIS traffic.
                  </p>
                </div>
              </Reveal>

              <div className="fmi-engineering-grid">
                <Reveal>
                  <div className="fmi-log-card">
                    <div className="fmi-log-card__header">
                      <span>VESSEL_LOG / SYSTEM</span>
                      <span className="fmi-status">STABLE_CONNECTED</span>
                    </div>
                    <div className="fmi-log-card__terminal">
                      <p><span>01</span> AIS positions received <b>OK</b></p>
                      <p><span>02</span> Vessel metadata merged <b>OK</b></p>
                      <p><span>03</span> GeoJSON source updated <b>OK</b></p>
                      <p><span>04</span> Symbol layer rendered <b>OK</b></p>
                      <p><span>05</span> Client cache synchronized <b>OK</b></p>
                    </div>
                    <div className="fmi-log-card__pulse">
                      <Activity size={15} aria-hidden="true" />
                      <span>Telemetry pipeline operational</span>
                      <i />
                    </div>
                  </div>
                </Reveal>

                <Reveal>
                  <div className="fmi-architecture">
                    {architecture.map(([name, detail]) => (
                      <div key={name} className="fmi-architecture__row">
                        <span>{name}</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal>
                <div className="fmi-code-story">
                  <div>
                    <span className="fmi-section-label fmi-section-label--blue">SERVER-SIDE AGGREGATION</span>
                    <h3>Fresh positions. Cached metadata. One GeoJSON source.</h3>
                  </div>
                  <p>
                    The vessels route handler fans out requests to the maritime
                    API, caches position data more aggressively than slow-changing
                    vessel metadata, and joins the feeds before the client sees
                    them. Less work in the browser. Cleaner data flow.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="fmi-section fmi-section--light fmi-visual-section">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-split">
                  <div>
                    <span className="fmi-section-label">04 / VESSEL INTELLIGENCE</span>
                    <h2>Every vessel can become a story.</h2>
                  </div>
                  <p>
                    Select a vessel from the map or table, move the camera to its
                    position and inspect the available operational metadata.
                  </p>
                </div>
              </Reveal>

              <div className="fmi-visual-grid">
                <Reveal>
                  <div className="fmi-image-card fmi-image-card--tall">
                    <Image
                      src={vesselLog}
                      alt="FMI vessel log page with vessel telemetry history and position lock"
                      sizes="(max-width: 768px) 94vw, 760px"
                      className="fmi-story-image"
                    />
                    <div className="fmi-image-card__caption fmi-image-card__caption--light">
                      <span>VESSEL LOG</span><span>TELEMETRY HISTORY</span>
                    </div>
                  </div>
                </Reveal>

                <Reveal className="fmi-visual-grid__text">
                  <div>
                    <Radio size={24} aria-hidden="true" />
                    <h3>Context follows the vessel.</h3>
                    <p>
                      Shared context connects the map, table and detail view,
                      so selecting a vessel in one part of the dashboard can
                      drive the others without unnecessary prop chains.
                    </p>
                  </div>
                  <div>
                    <ShieldCheck size={24} aria-hidden="true" />
                    <h3>Clear provenance.</h3>
                    <p>
                      The project identifies the public data source and makes
                      the distinction between this portfolio product and the
                      Finnish transport authorities explicit.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="data" className="fmi-section fmi-section--dark fmi-analytics">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-split">
                  <div>
                    <span className="fmi-section-label fmi-section-label--blue">05 / ANALYTICS</span>
                    <h2>See the fleet beyond the map.</h2>
                  </div>
                  <p>
                    Aggregated vessel behavior becomes a second layer of
                    intelligence through speed and utilization visualizations.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="fmi-image-card">
                  <Image
                    src={analytics}
                    alt="FMI fleet intelligence analytics dashboard showing speed comparisons and operational trends"
                    sizes="(max-width: 768px) 94vw, 1200px"
                    className="fmi-story-image"
                  />
                  <div className="fmi-image-card__caption">
                    <span>FLEET INTELLIGENCE</span><span>RECHARTS</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="fmi-source">
            <div className="fmi-container">
              <Reveal>
                <div className="fmi-source__inner">
                  <div className="fmi-source__icon" aria-hidden="true">
                    <Globe2 size={24} />
                  </div>
                  <div>
                    <span className="fmi-section-label">DATA PROVENANCE</span>
                    <h2>Real maritime data. Public infrastructure.</h2>
                    <p>
                      Vessel and port-call intelligence is sourced from
                      Fintraffic / Digitraffic&apos;s public Marine Traffic API.
                      No API key is required.
                    </p>
                  </div>
                  <a
                    href="https://www.digitraffic.fi/en/marine-traffic/"
                    target="_blank"
                    rel="noreferrer"
                    className="fmi-button fmi-button--dark"
                  >
                    View data source <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="fmi-cta">
            <div className="fmi-cta__grid" aria-hidden="true" />
            <div className="fmi-container fmi-cta__inner">
              <Reveal>
                <span className="fmi-section-label fmi-section-label--blue">F.M.I. / READY</span>
                <h2>Explore the live<br /><span>maritime picture.</span></h2>
                <p>
                  Open the operational dashboard and interact with the same
                  intelligence interface described above.
                </p>
                <div className="fmi-hero__actions">
                  <Link href="/ui/dashboard" className="fmi-button">
                    Open live dashboard <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <a
                    href="https://github.com/Djsteplion/Finnish-Maritime-Intelligence"
                    target="_blank"
                    rel="noreferrer"
                    className="fmi-button fmi-button--ghost fmi-button--ghost-light"
                  >
                    Inspect the code <Github size={17} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="fmi-footer">
          <div className="fmi-container fmi-footer__inner">
            <div className="fmi-brand">
              <span className="fmi-brand__signal" aria-hidden="true">
                <span /><span /><span />
              </span>
              <span>
                <strong>F.M.I.</strong>
                <small>FINNISH MARITIME INTELLIGENCE</small>
              </span>
            </div>
            <div className="fmi-footer__links">
              <a href="#main-content">Back to top</a>
              <a href="https://meri.digitraffic.fi/" target="_blank" rel="noreferrer">Digitraffic</a>
              <a href="https://www.digitraffic.fi/en/marine-traffic/" target="_blank" rel="noreferrer">Marine Traffic API</a>
              <a href="https://github.com/Djsteplion/Finnish-Maritime-Intelligence" target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <p>
              © {new Date().getFullYear()} Finnish Maritime Intelligence. Portfolio project.
              Not affiliated with Fintraffic.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
