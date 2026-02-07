import type { StationView } from "./types";
import { OfflineStationCard } from "./offline-station-card";
import { StationCard } from "./station-card";

type StationGridProps = {
  stations: StationView[];
  onOpenOrderModal: (stationId: number) => void;
};

export function StationGrid({
  stations,
  onOpenOrderModal,
}: StationGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {stations.map((station) => {
        if (station.offline) {
          return (
            <OfflineStationCard
              key={`offline-${station.id}`}
              stationId={station.id}
            />
          );
        }

        return (
          <StationCard
            key={station.id}
            station={station}
            onOpenOrderModal={onOpenOrderModal}
          />
        );
      })}
    </div>
  );
}
