import "../styles/maintenance.css";

const MaintenancePage = () => {
  return (
    <div className="maintenance-wrap">
      <div className="maintenance-glow maintenance-glow-left" />
      <div className="maintenance-glow maintenance-glow-right" />

      <main className="maintenance-card" role="status" aria-live="polite">
        <div className="maintenance-loader" />

        <h1>StudyPdfHub is under maintenance</h1>
        <p>
          We are fixing a backend issue right now. PDF content is temporarily unavailable.
          Please check again in a little while.
        </p>

        <div className="maintenance-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </main>
    </div>
  );
};

export default MaintenancePage;
