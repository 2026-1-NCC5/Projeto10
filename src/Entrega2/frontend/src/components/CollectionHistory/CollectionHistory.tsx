import { useEffect, useMemo, useState } from "react";

import type { CollectionEntry } from "../../types";
import GlassPanel from "../GlassPanel/GlassPanel";
import {
  HistoryRoot,
  HistoryHeader,
  HistoryTitle,
  HistoryHint,
  HistoryTable,
  HistoryHeaderRow,
  HistoryRow,
  EmptyState,
} from "./styles";


interface Props {
  fetchEntries: () => Promise<CollectionEntry[]>;
  refreshKey?: number;
  title?: string;
  hint?: string;
  pageSize?: number;
}


function CollectionHistory({
  fetchEntries,
  refreshKey = 0,
  title = "Histórico de coletas",
  hint,
  pageSize = 20,
}: Props) {
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEntries()
      .then((rows) => {
        if (!cancelled) setEntries(rows);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEntries, refreshKey]);

  const visible = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, pageSize);
  }, [entries, pageSize]);

  return (
    <HistoryRoot>
      <HistoryHeader>
        <HistoryTitle>{title}</HistoryTitle>
        {hint && <HistoryHint>{hint}</HistoryHint>}
      </HistoryHeader>
      <GlassPanel>
        <HistoryTable>
          <HistoryHeaderRow>
            <div>Data</div>
            <div>Item</div>
            <div>Quantidade</div>
            <div>Peso (kg)</div>
            <div>Registrado por</div>
          </HistoryHeaderRow>
          {loading ? (
            <EmptyState>Carregando...</EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState>Nenhuma coleta registrada ainda.</EmptyState>
          ) : (
            visible.map((entry) => (
              <HistoryRow key={entry.id}>
                <div>{new Date(entry.addedAt).toLocaleString()}</div>
                <div>
                  {entry.itemType}
                  {entry.itemName ? ` · ${entry.itemName}` : ""}
                </div>
                <div>{entry.quantity}</div>
                <div>{Number(entry.weight ?? 0).toFixed(2)}</div>
                <div>{entry.addedBy}</div>
              </HistoryRow>
            ))
          )}
        </HistoryTable>
      </GlassPanel>
    </HistoryRoot>
  );
}


export default CollectionHistory;
