import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "Belgeler Hazırlanıyor", label: "Belgeler Hazırlanıyor" },
  { value: "Başvuru Yapıldı", label: "Başvuru Yapıldı" },
  { value: "Sonuç Bekleniyor", label: "Sonuç Bekleniyor" },
];

function ApplicationForm({ onAdd }) {
  const [university, setUniversity] = useState("");
  const [gpa, setGpa] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = university.trim();
    const normalizedGpa = gpa.replace(",", ".");
    const numericGpa = parseFloat(normalizedGpa);

    if (!name) {
      setError("Lütfen hedef üniversite adını girin.");
      return;
    }

    if (Number.isNaN(numericGpa) || numericGpa < 0 || numericGpa > 4) {
      setError("Not ortalaması 0.00 ile 4.00 arasında bir sayı olmalıdır.");
      return;
    }

    onAdd({
      id: Date.now().toString(),
      university: name,
      gpa: numericGpa.toFixed(2),
      status,
      createdAt: new Date().toISOString(),
    });

    setUniversity("");
    setGpa("");
    setStatus(STATUS_OPTIONS[0].value);
    setError("");
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">Yeni Başvuru Ekle</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="university" className="form-label">
              Hedef Üniversite
            </label>
            <input
              id="university"
              type="text"
              className="form-control"
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              placeholder="Üniversite adı"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="gpa" className="form-label">
              Not Ortalaması (GPA)
            </label>
            <input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              className="form-control"
              value={gpa}
              onChange={(event) => setGpa(event.target.value)}
              placeholder="2.80"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="form-label">
              Başvuru Durumu
            </label>
            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100">
            Başvuruyu Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;
