import type { ChangeEvent } from "react";
import { useState } from "react";
import {
	uploadFile,
	validateFile,
	type UploadFolder,
} from "#/core/helpers/upload.helper";

interface UseFileUploadOptions {
	folder: UploadFolder;
	onSuccess: (publicUrl: string, file: File) => void;
}

export const useFileUpload = ({ folder, onSuccess }: UseFileUploadOptions) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const error = validateFile(file, folder);
		if (error) {
			setUploadError(error);
			return;
		}

		setUploadError(null);
		setIsUploading(true);
		try {
			const publicUrl = await uploadFile(folder, file);
			onSuccess(publicUrl, file);
		} catch {
			setUploadError("Upload failed. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	return { isUploading, uploadError, handleFileChange };
};
