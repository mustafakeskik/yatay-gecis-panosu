import ApplicationCard from "./ApplicationCard";

function ApplicationList({ applications, onUpdateStatus, onRemove }) {
  if (!applications.length) {
    return (
      <div className="alert alert-secondary">
        Henüz eklenmiş bir başvuru yok. Yeni bir başvuru eklemek için formu kullanın.
      </div>
    );
  }

  return (
    <div className="row g-4">
      {applications.map((application) => (
        <div key={application.id} className="col-12 col-md-6 col-xl-4">
          <ApplicationCard
            application={application}
            onStatusChange={onUpdateStatus}
            onDelete={onRemove}
          />
        </div>
      ))}
    </div>
  );
}

export default ApplicationList;
