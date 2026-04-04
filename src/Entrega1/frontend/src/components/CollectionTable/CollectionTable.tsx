import type { CollectionEntry } from "../../types";
import {
  TableContainer,
  TableTitle,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableCell,
  ItemBadge,
  EmptyState,
} from "./styles";


interface CollectionTableProps {
  entries: CollectionEntry[];
  title?: string;
  emptyMessage?: string;
}

function CollectionTable({ entries, title = "Histórico", emptyMessage }: CollectionTableProps) {
  return (
    <TableContainer>
      <TableTitle>{title}</TableTitle>
      <TableHeader>
        <TableHeaderCell>Item</TableHeaderCell>
        <TableHeaderCell>Quantidade</TableHeaderCell>
        <TableHeaderCell>Peso (kg)</TableHeaderCell>
        <TableHeaderCell>Adicionado por</TableHeaderCell>
      </TableHeader>
      {entries.length === 0 ? (
        <EmptyState>{emptyMessage ?? "Nenhum registro ainda."}</EmptyState>
      ) : (
        entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell component="div">
              <ItemBadge itemtype={entry.itemType}>
                {entry.itemType === "Outros" && entry.itemName
                  ? `${entry.itemType} (${entry.itemName})`
                  : entry.itemType}
              </ItemBadge>
            </TableCell>
            <TableCell>{entry.quantity}</TableCell>
            <TableCell>{entry.weight.toFixed(1)}</TableCell>
            <TableCell>{entry.addedBy}</TableCell>
          </TableRow>
        ))
      )}
    </TableContainer>
  );
}

export default CollectionTable;
