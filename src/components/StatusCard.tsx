import SvgBadge from './SvgBadge';

export default function StatusCard() {
  return (
    <SvgBadge
      src="/api/status.svg"
      alt="LowLevelNotes API status"
      unavailableLabel="Status unavailable"
    />
  );
}
