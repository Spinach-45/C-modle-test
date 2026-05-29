import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title = '確認操作', message, icon = '⚠️',
  confirmLabel = '確認', confirmClass = 'btn-danger',
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className={confirmClass} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
