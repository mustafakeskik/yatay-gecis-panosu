import { useMemo, useState, useEffect } from "react";
import YOK_OFFERS from "../data/yok-offers.json";

const AVAILABLE_PROGRAMS = YOK_OFFERS.offers.map((offer, index) => {
  const normalizedUniversity = offer.university.replace(/\s*\([^)]*\)$/, "");
  const normalizeUniForUrl = (name) => {
    const cleaned = name
      .replace(/\s+üniversitesi?$/i, "")
      .replace(/\s+yüksekokulu?$/i, "")
      .replace(/\s+fakültesi?$/i, "")
      .replace(/\s+konservatuarı?$/i, "")
      .replace(/\s+meslek yüksekokulu?$/i, "");

    return cleaned
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "");
  };

  return {
    id: offer.id || `yok-${index}`,
    university: normalizedUniversity,
    city: offer.city,
    department: offer.department,
    degree: offer.degree === "ÖNLISANS" ? "Önlisans" : "Lisans",
    minAgno: offer.degree === "ÖNLISANS" ? 2.2 : 2.6,
    minScore: offer.minScore || 0,
    transferUrl: `https://www.${normalizeUniForUrl(normalizedUniversity)}.edu.tr/`,
    requirements: `${offer.department} için YÖK Atlas verilerine göre en düşük YKS puanı ${offer.minScore}.`,
  };
});

const DEPARTMENTS = [
  "Bilgisayar Mühendisliği",
  "Endüstri Mühendisliği",
  "Bilgisayar Programcılığı",
  "İşletme",
  "Hukuk",
  "Tıp",
  "Mimarlık",
  "İktisat",
  "Psikoloji",
  "Elektrik-Elektronik Mühendisliği",
  "Makine Mühendisliği",
  "Biyoteknoloji",
  "Tarih",
  "Eğitim Bilimleri",
  "Gastronomi ve Mutfak Sanatları",
  "Siyaset Bilimi",
  "Moleküler Biyoloji ve Genetik",
  "Çevre Mühendisliği",
  "Grafik Tasarım",
  "Sağlık Yönetimi",
  "Fen Bilimleri Eğitimi",
  "Kimya Mühendisliği",
  "Havacılık ve Uzay Mühendisliği",
  "Denizcilik",
  "Farmakoloji",
  "Medya ve İletişim",
  "Elektronik Teknolojisi",
  "Turizm ve Otelcilik",
  "Sosyoloji",
  "Bankacılık ve Finans",
  "Bilişim Sistemleri",
  "Çocuk Gelişimi",
  "Rehberlik ve Psikolojik Danışmanlık",
  "Gıda Mühendisliği",
  "Metalurji ve Malzeme Mühendisliği",
  "Nanoteknoloji",
  "Dijital Oyun Tasarımı",
  "Hukuk",
];



const UNIVERSITY_NAMES = [...new Set(AVAILABLE_PROGRAMS.map((program) => program.university))];
const CITIES = [...new Set(AVAILABLE_PROGRAMS.map((program) => program.city))];

const normalizeSearch = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

function Landing({ onContinue }) {
  const [agno, setAgno] = useState("");
  const [score, setScore] = useState("");
  const [degree, setDegree] = useState("Önlisans");
  const [selectedUniversities, setSelectedUniversities] = useState(UNIVERSITY_NAMES);
  const [selectedDepartments, setSelectedDepartments] = useState(DEPARTMENTS);
  const [selectedCities, setSelectedCities] = useState(CITIES);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [universityFilter, setUniversityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    document.title = "Yatay Geçiş Başvuru Panosu";
  }, []);

  const numericAgno = parseFloat(agno.replace(",", "."));
  const numericScore = parseFloat(score.replace(",", "."));
  const hasValidInput = !Number.isNaN(numericAgno) && !Number.isNaN(numericScore);

  const filteredPrograms = useMemo(() => {
    return AVAILABLE_PROGRAMS.filter((program) => {
      const meetsDegree = program.degree === degree;
      const meetsUniversity = selectedUniversities.includes(program.university);
      const meetsDepartment = selectedDepartments.includes(program.department);
      const meetsCity = selectedCities.includes(program.city);
      const meetsAgno = hasValidInput ? numericAgno >= program.minAgno : true;
      const meetsScore = hasValidInput ? numericScore >= program.minScore : true;
      return meetsDegree && meetsUniversity && meetsDepartment && meetsCity && meetsAgno && meetsScore;
    });
  }, [degree, selectedUniversities, selectedDepartments, selectedCities, numericAgno, numericScore, hasValidInput]);

  const searchResults = useMemo(() => {
    return hasSearched ? filteredPrograms : [];
  }, [hasSearched, filteredPrograms]);

  const isAllProgramsSelected = searchResults.length > 0 && searchResults.every((program) => selectedPrograms.includes(program.id));

  const toggleFilter = (value, values, setValues) => {
    setValues((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const visibleUniversities = UNIVERSITY_NAMES.filter((name) =>
    normalizeSearch(name).startsWith(normalizeSearch(universityFilter))
  );

  const visibleDepartments = DEPARTMENTS.filter((department) =>
    normalizeSearch(department).startsWith(normalizeSearch(departmentFilter))
  );

  const visibleCities = CITIES.filter((city) =>
    normalizeSearch(city).startsWith(normalizeSearch(cityFilter))
  );

  const toggleAllUniversities = () => {
    const isAllSelected = selectedUniversities.length === UNIVERSITY_NAMES.length;
    setSelectedUniversities(isAllSelected ? [] : UNIVERSITY_NAMES);
  };

  const toggleAllDepartments = () => {
    const isAllSelected = selectedDepartments.length === DEPARTMENTS.length;
    setSelectedDepartments(isAllSelected ? [] : DEPARTMENTS);
  };

  const toggleAllCities = () => {
    const isAllSelected = selectedCities.length === CITIES.length;
    setSelectedCities(isAllSelected ? [] : CITIES);
  };

  const toggleAllPrograms = () => {
    if (isAllProgramsSelected) {
      setSelectedPrograms([]);
    } else {
      setSelectedPrograms(searchResults.map((program) => program.id));
    }
  };

  const handleProgramToggle = (id) => {
    setSelectedPrograms((current) =>
      current.includes(id) ? current.filter((programId) => programId !== id) : [...current, id]
    );
  };

  const handleSearch = () => {
    if (!hasValidInput) {
      setHasSearched(true);
      return;
    }
    setHasSearched(true);
  };

  const handleContinue = () => {
    const selectedApplications = searchResults
      .filter((program) => selectedPrograms.includes(program.id))
      .map((program) => ({
        id: `${program.id}-${Date.now()}`,
        programId: program.id,
        university: program.university,
        department: program.department,
        city: program.city,
        degree: program.degree,
        transferUrl: program.transferUrl,
        gpa: numericAgno.toFixed(2),
        status: "Belgeler Hazırlanıyor",
        createdAt: new Date().toISOString(),
      }));
    onContinue(selectedApplications);
  };

  return (
    <main className="container py-5">
      <div className="landing-banner mb-4 rounded-3 overflow-hidden">
        <div className="container py-4 d-flex align-items-center gap-3">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
            }}
          >
            <img
              src="/favicon.png"
              alt="logo"
              style={{ width: 42, height: 42, objectFit: "contain" }}
            />
          </div>
          <div>
            <h1 className="display-6 fw-semibold text-white mb-1">Yatay Geçiş Başvuru Panosu</h1>
            <p className="text-white-50 mb-0">YKS puanınız ve AGNO'nuzu girerek yatay geçiş için uygun üniversite ve bölümleri seçin.</p>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 rounded-0">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h5 className="card-title mb-0">Arama Bilgileri</h5>
          </div>
          <div className="row row-cols-1 row-cols-md-4 g-3 align-items-start">
            <div className="col d-flex flex-column">
              <label htmlFor="agno" className="form-label mb-2">
                AGNO
              </label>
              <input
                id="agno"
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="form-control"
                value={agno}
                onChange={(event) => setAgno(event.target.value)}
                placeholder="2.80"
              />
            </div>
            <div className="col d-flex flex-column">
              <label htmlFor="score" className="form-label mb-2">
                YKS Puanı
              </label>
              <input
                id="score"
                type="number"
                className="form-control"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                placeholder="Sınav puanınızı girin"
              />
            </div>
            <div className="col d-flex flex-column">
              <label className="form-label mb-2">Eğitim Düzeyi</label>
              <div className="btn-group w-100" role="group" aria-label="Eğitim düzeyi">
                {['Önlisans', 'Lisans'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`btn ${degree === option ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setDegree(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="col d-flex justify-content-end align-items-start gap-2 flex-wrap">
              <button type="button" className="btn btn-primary" onClick={handleSearch}>
                Ara
              </button>
            </div>
          </div>

            <div className="mt-4 border rounded-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Filtreler</h6>
              </div>

              <div className="row row-cols-1 row-cols-md-3 g-3">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="fw-semibold mb-0">Üniversiteler</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      style={{ minWidth: 110, padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={toggleAllUniversities}
                    >
                      {selectedUniversities.length === UNIVERSITY_NAMES.length ? 'Seçimleri Kaldır' : 'Hepsini Seç'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Üniversite ara"
                    value={universityFilter}
                    onChange={(event) => setUniversityFilter(event.target.value)}
                  />
                  {universityFilter.trim() === '' ? (
                    <div className="text-muted small">Aramak için üniversite adını yazın.</div>
                  ) : visibleUniversities.length === 0 ? (
                    <div className="text-muted small">Eşleşme bulunamadı.</div>
                  ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {visibleUniversities.slice(0, 100).map((name) => (
                        <div key={name} className="form-check">
                          <input
                            id={`uni-${name}`}
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedUniversities.includes(name)}
                            onChange={() => toggleFilter(name, selectedUniversities, setSelectedUniversities)}
                          />
                          <label htmlFor={`uni-${name}`} className="form-check-label">
                            {name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="fw-semibold mb-0">Bölümler</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      style={{ minWidth: 110, padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={toggleAllDepartments}
                    >
                      {selectedDepartments.length === DEPARTMENTS.length ? 'Seçimleri Kaldır' : 'Hepsini Seç'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Bölüm ara"
                    value={departmentFilter}
                    onChange={(event) => setDepartmentFilter(event.target.value)}
                  />
                  {departmentFilter.trim() === '' ? (
                    <div className="text-muted small">Aramak için bölüm adını yazın.</div>
                  ) : visibleDepartments.length === 0 ? (
                    <div className="text-muted small">Eşleşme bulunamadı.</div>
                  ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {visibleDepartments.slice(0, 100).map((department) => (
                        <div key={department} className="form-check">
                          <input
                            id={`dept-${department}`}
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedDepartments.includes(department)}
                            onChange={() => toggleFilter(department, selectedDepartments, setSelectedDepartments)}
                          />
                          <label htmlFor={`dept-${department}`} className="form-check-label">
                            {department}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="fw-semibold mb-0">Şehirler</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      style={{ minWidth: 110, padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                      onClick={toggleAllCities}
                    >
                      {selectedCities.length === CITIES.length ? 'Seçimleri Kaldır' : 'Hepsini Seç'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Şehir ara"
                    value={cityFilter}
                    onChange={(event) => setCityFilter(event.target.value)}
                  />
                  {cityFilter.trim() === '' ? (
                    <div className="text-muted small">Aramak için şehir adını yazın.</div>
                  ) : visibleCities.length === 0 ? (
                    <div className="text-muted small">Eşleşme bulunamadı.</div>
                  ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                      {visibleCities.slice(0, 100).map((city) => (
                        <div key={city} className="form-check">
                          <input
                            id={`city-${city}`}
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={() => toggleFilter(city, selectedCities, setSelectedCities)}
                          />
                          <label htmlFor={`city-${city}`} className="form-check-label">
                            {city}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Selected chips and action button placed together */}
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          {selectedPrograms.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {searchResults
                .filter((program) => selectedPrograms.includes(program.id))
                .map((program) => (
                  <span key={program.id} className="badge bg-secondary py-2 px-3">
                    {program.university} - {program.department}
                  </span>
                ))}
            </div>
          ) : (
            <span className="text-muted small">Henüz seçim yapılmadı</span>
          )}
        </div>

        <div className="text-end">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedPrograms.length || !hasValidInput || !hasSearched}
            onClick={handleContinue}
          >
            Seçilenlerle Başvurulara Geç
          </button>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="card-title">Arama Sonuçları</h5>
              <p className="text-muted mb-0">Aşağıdaki sonuçlar YKS ve AGNO değerlerinize göre sıralanmıştır.</p>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={toggleAllPrograms}>
              {isAllProgramsSelected ? 'Seçimleri Kaldır' : 'Hepsini Seç'}
            </button>
          </div>

          {!hasSearched ? (
            <div className="alert alert-info">Arama yapmak için AGNO ve YKS puanınızı girin, sonra Ara butonuna basın.</div>
          ) : !hasValidInput ? (
            <div className="alert alert-danger">Geçerli bir AGNO ve YKS puanı girin.</div>
          ) : searchResults.length === 0 ? (
            <div className="alert alert-warning">Seçtiğiniz filtrelerle eşleşen bir program bulunamadı.</div>
          ) : (
            <div className="list-group">
              {searchResults.map((program) => (
                <label
                  key={program.id}
                  className={`list-group-item list-group-item-action d-flex align-items-start gap-3 ${selectedPrograms.includes(program.id) ? 'active' : ''}`}
                  style={{ backgroundColor: '#e7f0ff', borderColor: '#c7dbff' }}
                >
                  <input
                    className="form-check-input mt-1"
                    type="checkbox"
                    checked={selectedPrograms.includes(program.id)}
                    onChange={() => handleProgramToggle(program.id)}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <strong>{program.university}</strong>
                        <div>{program.department}</div>
                      </div>
                      <span className="badge bg-success">{program.degree}</span>
                    </div>
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-1">
                      <span className="badge text-white" style={{ backgroundColor: '#d63333' }}>
                        AGNO {program.minAgno}
                      </span>
                      <span className="badge text-white" style={{ backgroundColor: '#d63333' }}>
                        Taban YKS {program.minScore}
                      </span>
                    </div>
                    <p className="mb-2" style={{ color: '#000' }}>{program.requirements}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

export default Landing;
