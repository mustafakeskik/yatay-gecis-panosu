const STATUS_OPTIONS = [
  { value: "Belgeler Hazırlanıyor", label: "Belgeler Hazırlanıyor" },
  { value: "Başvuru Yapıldı", label: "Başvuru Yapıldı" },
  { value: "Sonuç Bekleniyor", label: "Sonuç Bekleniyor" },
];

function ApplicationCard({ application, onStatusChange, onDelete }) {
  const { id, university, department, city, degree, gpa, status, createdAt, transferUrl } = application;
  const createdDate = new Date(createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="mb-3">
          <h5 className="card-title mb-1">{university}</h5>
          {department && <p className="mb-1">{department}</p>}
          <p className="text-muted mb-0">{degree} • {city}</p>
          <p className="text-muted mb-1">GPA: {gpa}</p>
          <small className="text-muted">Eklenme tarihi: {createdDate}</small>
        </div>

        <div className="action-panel mt-3 p-3 rounded-3 border">
          <div className="mb-2">
            <label htmlFor={`status-${id}`} className="form-label mb-1">
              Durum
            </label>
            <select
              id={`status-${id}`}
              className="form-select"
              value={status}
              onChange={(event) => onStatusChange(id, event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex flex-column gap-2">
            {/* Continue to transfer site - full width button */}
            {transferUrl && (
              <a
                className="btn btn-sm btn-outline-secondary w-100"
                href={transferUrl}
                target="_blank"
                rel="noreferrer"
              >
                Başvuruya Devam Et
              </a>
            )}

            {/* Current status pill for quick glance - below the button */}
            <div>
              <span className="badge bg-success text-white">{status}</span>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm w-100"
              onClick={() => onDelete(id)}
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationCard;
