export function InstitutionalResponsiveStyles() {
  return (
    <style>{`
      .alex-page,
      .alex-page *,
      .master-events,
      .master-events * {
        box-sizing: border-box;
      }

      .alex-page {
        width: min(calc(100% - 32px), 1240px);
        margin: 0 auto;
      }

      .alex-page img,
      .master-events img {
        display: block;
        max-width: 100%;
        height: auto;
      }

      .alex-page,
      .alex-page * {
        min-width: 0;
      }

      .alex-hero-panel p,
      .alex-timeline-card p,
      .alex-admin-card dd {
        overflow-wrap: anywhere;
      }

      .alex-page input,
      .alex-page textarea,
      .alex-page select,
      .alex-page button {
        max-width: 100%;
      }

      @media (max-width: 900px) {
        .alex-page {
          width: min(calc(100% - 24px), 1240px);
        }

        .alex-hero-grid,
        .alex-section-grid,
        .alex-form-grid,
        .master-event-grid {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        .alex-hero-panel,
        .alex-timeline-card,
        .master-events {
          min-width: 0;
          padding: 28px 20px !important;
        }

        .alex-hero-panel h1 {
          font-size: clamp(2.25rem, 11vw, 4rem) !important;
          line-height: 1.02 !important;
        }

        .alex-modal-panel {
          width: calc(100vw - 24px) !important;
          max-height: calc(100dvh - 24px) !important;
          border-radius: 16px !important;
        }

        .alex-modal-header,
        .alex-modal-actions {
          align-items: stretch !important;
          flex-direction: column !important;
        }
      }

      @media (max-width: 600px) {
        .alex-page {
          width: calc(100% - 20px);
        }

        .alex-button,
        .alex-modal-actions button {
          width: 100% !important;
          justify-content: center;
        }

        .master-events {
          padding: 20px 16px !important;
        }
      }
    `}</style>
  );
}
