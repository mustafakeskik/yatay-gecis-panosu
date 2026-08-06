import { useEffect, useMemo, useState } from "react";
import ApplicationList from "../Components/ApplicationList";

const STORAGE_KEY = "yatay-gecis-basvurulari";

function Dashboard({ initialApplications = [], onBack, openImmediately = false }) {
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  });

  // If landing passed initialApplications, merge them into current applications (avoid duplicates)
  useEffect(() => {
    if (initialApplications && initialApplications.length) {
      setApplications((prev) => {
        const existingByProgram = new Set(prev.map((a) => a.programId));
        const toAdd = initialApplications.filter((a) => !existingByProgram.has(a.programId));
        if (toAdd.length === 0) return prev;
        // prepend new ones
        return [...toAdd, ...prev];
      });
    }
  }, [initialApplications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  // helper: open multiple urls sequentially with a delay to reduce popup blocking
  const openUrlsSequentially = (urls = [], delay = 600) => {
    const filtered = urls.filter(Boolean);
    filtered.forEach((url, index) => {
      setTimeout(() => {
        try {
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
          // ignore
        }
      }, index * delay);
    });
  };

  // If parent requested opening transfer URLs immediately (usually triggered from Landing),
  // open them sequentially. Browsers may still block, but sequential opens are more likely
  // to succeed than firing many at once.
  useEffect(() => {
    if (openImmediately && initialApplications && initialApplications.length) {
      const urls = initialApplications.map((a) => a.transferUrl).filter(Boolean);
      openUrlsSequentially(urls, 600);
    }
  }, [openImmediately, initialApplications]);

  const summary = useMemo(
    () => ({
      total: applications.length,
      preparing: applications.filter((app) => app.status === "Belgeler Hazırlanıyor").length,
      submitted: applications.filter((app) => app.status === "Başvuru Yapıldı").length,
      waiting: applications.filter((app) => app.status === "Sonuç Bekleniyor").length,
    }),
    [applications]
  );

  const handleUpdateStatus = (id, status) => {
    setApplications((prevApplications) =>
      prevApplications.map((application) =>
        application.id === id ? { ...application, status } : application
      )
    );
  };

  const handleRemoveApplication = (id) => {
    setApplications((prevApplications) => prevApplications.filter((application) => application.id !== id));
  };

  useEffect(() => {
    document.title = "Yatay Geçiş Başvuru Takip Panosu";
  }, []);

  return (
    <main className="container py-5">
      {onBack && (
        <div className="mb-4">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onBack}>
            Önceki Ekrana Dön
          </button>
        </div>
      )}
      <div className="mb-5 text-center">
        <h1 className="display-6 fw-semibold">Yatay Geçiş Başvuru Takip Panosu</h1>
        <p className="text-muted mx-auto" style={{ maxWidth: 700 }}>
          Hedef üniversite başvurularınızı, güncel not ortalamanızı ve başvuru sürecinizi buradan takip edin.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Toplam Başvuru</h6>
              <p className="display-6 mb-0">{summary.total}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-info">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Belgeler Hazırlanıyor</h6>
              <p className="display-6 mb-0">{summary.preparing}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-success">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Başvuru Yapıldı</h6>
              <p className="display-6 mb-0">{summary.submitted}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card shadow-sm h-100 border-warning">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Sonuç Bekleniyor</h6>
              <p className="display-6 mb-0">{summary.waiting}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title mb-0">Başvurular</h5>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      // open all transfer urls in new tabs
                      applications.forEach((app) => {
                        if (app.transferUrl) window.open(app.transferUrl, "_blank", "noopener,noreferrer");
                      });
                    }}
                  >
                    Tüm Başvuruları Aç
                  </button>
                </div>
              </div>
              <p className="text-muted mb-0">
                Listedeki başvuruların durumunu güncelleyebilir veya fazlalıkları silebilirsiniz.
              </p>
            </div>
          </div>
          <ApplicationList
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onRemove={handleRemoveApplication}
          />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
