import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, formInputCls } from "@/components/shared/Field";
import type { Canteen, CanteenInput } from "./types";

const optionalUrl = z.union([z.literal(""), z.string().url("Enter a valid URL")]);

const canteenSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  mailid: z.union([z.literal(""), z.string().email("Enter a valid email")]),
  phoneNumber: z.string().max(15),
  address: z.string().max(255),
  url: optionalUrl,
  imageUrl: optionalUrl,
});

type CanteenFormValues = z.infer<typeof canteenSchema>;

const toFormValues = (canteen: Canteen): CanteenFormValues => ({
  name: canteen.name,
  mailid: canteen.mailid ?? "",
  phoneNumber: canteen.phoneNumber ?? "",
  address: canteen.address ?? "",
  url: canteen.url ?? "",
  imageUrl: canteen.imageUrl ?? "",
});

interface CanteenFormProps {
  canteen: Canteen;
  isPending: boolean;
  onSubmit: (values: CanteenInput) => void;
  onCancel: () => void;
}

export function CanteenForm({ canteen, isPending, onSubmit, onCancel }: CanteenFormProps) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<CanteenFormValues>({ resolver: zodResolver(canteenSchema), defaultValues: toFormValues(canteen) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" error={errors.name?.message}>
        <Input {...register("name")} className={formInputCls} />
      </Field>
      <Field label="Email" error={errors.mailid?.message}>
        <Input {...register("mailid")} className={formInputCls} />
      </Field>
      <Field label="Phone number" error={errors.phoneNumber?.message}>
        <Input {...register("phoneNumber")} className={formInputCls} />
      </Field>
      <Field label="Website" error={errors.url?.message}>
        <Input {...register("url")} placeholder="https://" className={formInputCls} />
      </Field>
      <Field label="Address" error={errors.address?.message}>
        <Input {...register("address")} className={formInputCls} />
      </Field>
      <Field label="Image URL" error={errors.imageUrl?.message}>
        <Input {...register("imageUrl")} placeholder="https://" className={formInputCls} />
      </Field>

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 rounded-full border-border px-6">
          Cancel
        </Button>
      </div>
    </form>
  );
}
