import { z } from "zod";

export const InvoiceLineItemSchema = z.object({
	description: z.string().min(1, "Item description is required"),
	quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
	unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
	kind: z.enum(["labor", "material"], { message: "Select a kind" }),
});
export type InvoiceLineItemForm = z.infer<typeof InvoiceLineItemSchema>;

export const InvoiceSchema = z.object({
	description: z.string().min(1, "Description is required"),
	lineItems: z
		.array(InvoiceLineItemSchema)
		.min(1, "Add at least one line item"),
});
export type InvoiceForm = z.infer<typeof InvoiceSchema>;
