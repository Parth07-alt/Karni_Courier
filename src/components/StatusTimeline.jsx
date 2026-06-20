import { STATUS_FLOW, STATUS_LABELS } from '../utils/awbGenerator';

const StatusTimeline = ({ currentStatus, timeline = [] }) => {
  const statusIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="status-timeline">
      {STATUS_FLOW.map((status, idx) => {
        const isDone = idx < statusIndex;
        const isCurrent = idx === statusIndex;
        const info = STATUS_LABELS[status];
        const timelineEntry = timeline.find(t => t.status === status);

        return (
          <div
            key={status}
            className={`timeline-item${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}
          >
            <div className="tl-dot">
              {isDone && <i className="fa-solid fa-check" style={{ fontSize: '0.875rem' }} />}
              {isCurrent && <i className={`fa-solid ${info.icon}`} style={{ fontSize: '0.875rem' }} />}
              {!isDone && !isCurrent && <i className={`fa-solid ${info.icon}`} style={{ fontSize: '0.875rem', color: 'var(--border)' }} />}
            </div>
            <div className="tl-content" style={{ paddingTop: 8 }}>
              <h4 style={{ color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-light)' }}>
                {info.label}
              </h4>
              {timelineEntry?.note && (
                <p>{timelineEntry.note}</p>
              )}
              {timelineEntry?.timestamp && (
                <div className="tl-time">
                  <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                  {new Date(timelineEntry.timestamp?.toDate?.() || timelineEntry.timestamp).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              )}
              {isCurrent && !timelineEntry && (
                <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
