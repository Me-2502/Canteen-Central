import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, formInputCls } from "@/components/shared/Field";
import { ITEM_TYPE_LABELS, ITEM_TYPES, type Item, type ItemInput } from "./types";

const price = z.number({ invalid_type_error: "Enter a number" });

const itemSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    description: z.string().max(500),
    type: z.enum(["FOOD", "SNACK", "BEVERAGE", "COMBO", "OTHER"]),
    measure: price.positive("Must be more than 0"),
    unitPrice: price.positive("Must be more than 0"),
    discount: price.min(0, "Cannot be negative"),
    imageUrl: z.union([z.literal(""), z.string().url("Enter a valid URL")]),
  })
  .refine((v) => v.discount <= v.unitPrice, { path: ["discount"], message: "Cannot be more than the price" });

type ItemFormValues = z.infer<typeof itemSchema>;

const EMPTY_ITEM: ItemFormValues = {
  name: "", description: "", type: "FOOD", measure: 1, unitPrice: 0, discount: 0, imageUrl: "",
};

export const toItemFormValues = (item: Item): ItemFormValues => ({
  name: item.name,
  description: item.description ?? "",
  type: item.type,
  measure: item.measure,
  unitPrice: item.unitPrice,
  discount: item.discount,
  imageUrl: item.imageUrl ?? "",
});

interface ItemFormProps {
  defaultValues?: ItemFormValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: ItemInput) => void;
  onCancel?: () => void;
}

export function ItemForm({ defaultValues = EMPTY_ITEM, submitLabel, isPending, onSubmit, onCancel }: ItemFormProps) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<ItemFormValues>({ resolver: zodResolver(itemSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" error={errors.name?.message}>
        <Input {...register("name")} className={formInputCls} />
      </Field>
      <Field label="Type" error={errors.type?.message}>
        <select {...register("type")} className={`w-full border ${formInputCls}`}>
          {ITEM_TYPES.map((t) => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description" error={errors.description?.message}>
          <textarea {...register("description")} rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 font-normal" />
        </Field>
      </div>
      <Field label="Price" error={errors.unitPrice?.message}>
        <Input type="number" step="0.01" {...register("unitPrice", { valueAsNumber: true })} className={formInputCls} />
      </Field>
      <Field label="Discount (amount off)" error={errors.discount?.message}>
        <Input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} className={formInputCls} />
      </Field>
      <Field label="Measure (serving size)" error={errors.measure?.message}>
        <Input type="number" step="0.01" {...register("measure", { valueAsNumber: true })} className={formInputCls} />
      </Field>
      <Field label="Image URL" error={errors.imageUrl?.message}>
        <Input {...register("imageUrl")} placeholder="https://" className={formInputCls} />
      </Field>

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
          {isPending ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 rounded-full border-border px-6">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
