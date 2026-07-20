export function InstitutionalStyles() {
  return (
    <style>{`
      .alex-page, .master-events-section { width: min(1180px, calc(100% - 32px)); margin: 32px auto 120px; }
      .alex-hero, .alex-section, .master-events-panel { background: #fffaf2; border: 1px solid #dfd3c3; border-radius: 22px; }
      .alex-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); gap: 44px; padding: clamp(28px, 5vw, 72px); align-items: center; }
      .alex-hero h1, .alex-section h2, .master-events-panel h2 { margin: 10px 0 18px; color: #201d19; font-size: clamp(40px, 6vw, 78px); font-weight: 400; line-height: .98; }
      .alex-kicker, .alex-card-label, .master-events-kicker { color: #87501e; font-size: 12px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
      .alex-lead { max-width: 640px; color: #665b50; font-size: 18px; line-height: 1.65; }
      .alex-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
      .alex-primary-button, .alex-secondary-button { min-height: 46px; border-radius: 999px; border: 1px solid #2b251f; padding: 0 21px; font: inherit; font-weight: 700; cursor: pointer; transition: transform .2s ease, opacity .2s ease; }
      .alex-primary-button { background: #211d19; color: #fff; }
      .alex-secondary-button { background: #fffaf2; color: #211d19; }
      .alex-primary-button:hover, .alex-secondary-button:hover { transform: translateY(-2px); opacity: .88; }
      .alex-hero-panel { min-height: 360px; display: flex; flex-direction: column; justify-content: flex-end; padding: 30px; border-radius: 18px; background: #1d1b18; color: #fffaf2; position: relative; overflow: hidden; }
      .alex-hero-panel:before { content: ''; position: absolute; inset: 0; background: rgba(20, 16, 10, 0.62); opacity: .68; }
      .alex-hero-panel > * { position: relative; }
      .alex-hero-panel strong { font-size: 26px; font-weight: 500; }
      .alex-hero-panel p { color: #eee4d7; line-height: 1.6; }
      .alex-section { margin-top: 26px; padding: clamp(28px, 4vw, 56px); }
      .alex-section-copy { max-width: 780px; color: #665b50; font-size: 17px; line-height: 1.75; }
      .alex-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 30px; }
      .alex-feature-card { padding: 24px; border: 1px solid #dfd3c3; border-radius: 16px; background: #f7f0e6; }
      .alex-feature-card h3 { color: #201d19; font-size: 20px; font-weight: 500; margin: 8px 0; }
      .alex-feature-card p { margin: 0; color: #665b50; line-height: 1.55; }
      .alex-modal-backdrop { position: fixed; z-index: 220; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(25,22,18,.62); }
      .alex-modal { position: relative; width: min(980px, 100%); max-height: min(92vh, 960px); margin: auto; overflow: auto; padding: clamp(22px, 4vw, 42px); border: 1px solid #dfd3c3; border-radius: 22px; color: #201d19; background: #fffaf2; box-shadow: 0 26px 80px rgba(0,0,0,.26); }
      .alex-modal > h2 { margin: 14px 0 8px; color: #201d19; font-size: clamp(30px, 4vw, 52px); font-weight: 400; line-height: 1.05; }
      .alex-modal .alex-intro { margin: 0 0 28px; color: #665b50; line-height: 1.6; }
      .alex-close { position: sticky; top: 0; z-index: 2; width: 42px; height: 42px; display: grid; place-items: center; margin: 0 0 8px auto; border: 1px solid #cfc3b4; border-radius: 50%; color: #201d19; background: #fffaf2; cursor: pointer; }
      .alex-modal-header { display: flex; gap: 20px; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
      .alex-modal-header h2 { margin: 5px 0; color: #201d19; font-size: clamp(30px, 4vw, 52px); font-weight: 400; }
      .alex-close-button { width: 42px; height: 42px; border: 1px solid #dfd3c3; border-radius: 50%; background: transparent; font-size: 25px; cursor: pointer; }
      .alex-form-section { margin: 26px 0; padding-top: 20px; border-top: 1px solid #e2d7c9; }
      .alex-form-section h3 { margin: 0 0 14px; color: #201d19; font-size: 20px; font-weight: 500; }
      .alex-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .alex-field { display: grid; gap: 7px; color: #5d5145; font-size: 13px; font-weight: 700; }
      .alex-field.wide { grid-column: 1 / -1; }
      .alex-field input, .alex-field select, .alex-field textarea { width: 100%; box-sizing: border-box; min-height: 44px; padding: 11px 12px; border: 1px solid #d9cebf; border-radius: 10px; outline: none; background: #fffdf8; color: #201d19; font: inherit; font-weight: 400; }
      .alex-field textarea { min-height: 104px; resize: vertical; }
      .alex-consent { display: flex; gap: 10px; align-items: flex-start; padding: 13px; border: 1px solid #dfd3c3; border-radius: 10px; color: #4e443a; line-height: 1.45; }
      .alex-consent input { margin-top: 4px; }
      .alex-form-message { margin: 14px 0 0; color: #386b4b; font-weight: 700; }
      .alex-error { color: #a33b2f; }
      .alex-admin-grid { display: grid; grid-template-columns: minmax(260px, .75fr) minmax(0, 1.25fr); gap: 18px; }
      .alex-admin-list { display: grid; gap: 10px; }
      .alex-admin-item { width: 100%; padding: 16px; border: 1px solid #dfd3c3; border-radius: 12px; background: #fffdf8; color: #201d19; text-align: left; cursor: pointer; }
      .alex-admin-item.active { border-color: #6a4322; background: #f2e6d5; }
      .alex-admin-detail { min-height: 380px; padding: 22px; border: 1px solid #dfd3c3; border-radius: 14px; background: #fffdf8; }
      .alex-admin-detail h2 { margin-top: 0; color: #201d19; font-weight: 400; }
      .alex-admin-values { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .alex-admin-value { padding: 12px; border-radius: 10px; background: #f7f0e6; }
      .alex-admin-value strong { display: block; margin-bottom: 5px; color: #87501e; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
      .master-events-section { margin-top: 0; }
      .master-events-panel { padding: clamp(28px, 4vw, 52px); }
      .master-events-header { max-width: 750px; }
      .master-events-copy { color: #665b50; font-size: 17px; line-height: 1.65; }
      .master-events-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 30px; }
      .master-event-card { display: grid; gap: 12px; min-height: 155px; padding: 20px; border: 1px solid #dfd3c3; border-radius: 16px; background: #f7f0e6; }
      .master-event-date { width: fit-content; padding: 6px 9px; border-radius: 999px; background: #201d19; color: #fff; font-size: 12px; font-weight: 700; }
      .master-event-card h3 { margin: 0; color: #201d19; font-size: 20px; font-weight: 500; line-height: 1.2; }
      .master-event-card p { margin: 0; color: #665b50; }
      @media (max-width: 800px) {
        .alex-page, .master-events-section { width: min(100% - 22px, 620px); margin-top: 18px; margin-bottom: 80px; }
        .alex-hero { grid-template-columns: 1fr; gap: 22px; padding: 24px; }
        .alex-hero h1, .alex-section h2, .master-events-panel h2 { font-size: clamp(36px, 12vw, 56px); }
        .alex-hero-panel { min-height: 235px; padding: 24px; }
        .alex-grid, .master-events-grid { grid-template-columns: 1fr; }
        .alex-form-grid, .alex-admin-grid, .alex-admin-values { grid-template-columns: 1fr; }
        .alex-modal-backdrop { padding: 8px; }
        .alex-modal { max-height: 96vh; border-radius: 16px; }
        .alex-section { padding: 24px; }
      }
    `}</style>
  );
}
