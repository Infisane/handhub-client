import { getRequestData, request } from "./axios.helper";

export type UploadFolder = "portfolio" | "identity-doc" | "profile-photo";
type ContentType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

interface PresignResponse {
	uploadUrl: string;
	key: string;
	publicUrl: string;
}

const VALIDATION_RULES: Record<UploadFolder, { types: string[]; maxMb: number }> =
	{
		"identity-doc": {
			types: ["image/jpeg", "image/png", "application/pdf"],
			maxMb: 10,
		},
		portfolio: { types: ["image/jpeg", "image/png", "image/webp"], maxMb: 5 },
		"profile-photo": {
			types: ["image/jpeg", "image/png", "image/webp"],
			maxMb: 2,
		},
	};

export const validateFile = (file: File, folder: UploadFolder): string | null => {
	const { types, maxMb } = VALIDATION_RULES[folder];
	if (!types.includes(file.type))
		return `File type not allowed. Use: ${types.join(", ")}`;
	if (file.size > maxMb * 1024 * 1024) return `File too large. Max ${maxMb} MB.`;
	return null;
};

const getPresignedUrl = (folder: UploadFolder, contentType: ContentType) =>
	getRequestData<PresignResponse>(
		request.post("/api/uploads/presign", { folder, contentType }),
	);

const uploadToR2 = async (uploadUrl: string, file: File) => {
	const res = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});
	if (!res.ok) throw new Error("Upload to storage failed");
};

export const uploadFile = async (
	folder: UploadFolder,
	file: File,
): Promise<string> => {
	const { uploadUrl, publicUrl } = await getPresignedUrl(
		folder,
		file.type as ContentType,
	);
	await uploadToR2(uploadUrl, file);
	return publicUrl;
};
