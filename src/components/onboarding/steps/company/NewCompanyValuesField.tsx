

import React from "react";
import { Plus, Trash } from "lucide-react";

export interface ValueItem {
  title: string;
  description: string;
}

interface NewCompanyValuesFieldProps {
  values: ValueItem[];
  onChange: (values: ValueItem[]) => void;
}

const NewCompanyValuesField: React.FC<NewCompanyValuesFieldProps> = ({
  values,
  onChange,
}) => {
  const handleChange = (idx: number, key: "title" | "description", value: string) => {
    const updated = [...values];
    updated[idx][key] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...values, { title: "", description: "" }]);
  };

  const handleRemove = (idx: number) => {
    const updated = [...values];
    updated.splice(idx, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-500">Valores</label>
      <div className="space-y-3">
        {values.length === 0 && (
          <div className="text-gray-400 text-sm rounded bg-gray-50 border px-3 py-2">
            Nenhum valor adicionado.
          </div>
        )}
        {values.map((v, idx) => (
          <div key={idx} className="p-3 border rounded-md flex flex-col gap-2 relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={() => handleRemove(idx)}
              aria-label="Remover valor"
            >
              <Trash className="w-4 h-4" />
            </button>
            <div>
              <input
                type="text"
                className="border-b w-full rounded p-2 text-base focus-visible:ring-merinno-dark"
                placeholder="Título do valor (ex: Respeito)"
                value={v.title}
                onChange={e => handleChange(idx, "title", e.target.value)}
              />
            </div>
            <div>
              <textarea
                className="border w-full rounded p-2 min-h-[60px] text-base focus-visible:ring-merinno-dark"
                placeholder="Descrição deste valor"
                value={v.description}
                onChange={e => handleChange(idx, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="flex gap-2 items-center justify-center w-full border bg-gray-50 rounded-md p-2 text-gray-600 hover:bg-gray-100 transition"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" /> Adicionar Valor
        </button>
      </div>
    </div>
  );
};

export default NewCompanyValuesField;

