import StyledInput from "../StyledInput/StyledInput";
import {
  BlockRoot,
  BlockHeader,
  BlockIconBox,
  BlockTitle,
  FieldsColumn,
  BlockFooter,
  AddButton,
} from "./styles";


type CollectionBlockFields = {
  quantity: string;
  weight: string;
  itemName?: string;
};

interface CollectionBlockProps {
  title: string;
  icon: string;
  fields: CollectionBlockFields;
  onChange: (field: keyof CollectionBlockFields, value: string) => void;
  onAdd: () => void;
  disabled: boolean;
  showNameField?: boolean;
}

function CollectionBlock({
  title,
  icon,
  fields,
  onChange,
  onAdd,
  disabled,
  showNameField,
}: CollectionBlockProps) {
  return (
    <BlockRoot>
      <BlockHeader>
        <BlockIconBox>
          <span className="material-symbols-outlined">{icon}</span>
        </BlockIconBox>
        <BlockTitle>{title}</BlockTitle>
      </BlockHeader>
      <FieldsColumn>
        {showNameField && (
          <StyledInput
            label="Nome do item"
            icon="label"
            type="text"
            placeholder="Ex: Macarrao"
            value={fields.itemName ?? ""}
            onChange={(e) => onChange("itemName", e.target.value)}
          />
        )}
        <StyledInput
          label="Quantidade"
          icon="tag"
          type="number"
          placeholder="0"
          min="0"
          value={fields.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
        />
        <StyledInput
          label="Peso (kg)"
          icon="scale"
          type="number"
          placeholder="0.0"
          min="0"
          step="0.1"
          value={fields.weight}
          onChange={(e) => onChange("weight", e.target.value)}
        />
      </FieldsColumn>
      <BlockFooter>
        <AddButton disabled={disabled} onClick={onAdd}>
          <span className="material-symbols-outlined">add</span>
        </AddButton>
      </BlockFooter>
    </BlockRoot>
  );
}

export default CollectionBlock;
