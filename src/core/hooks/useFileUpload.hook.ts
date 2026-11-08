import type { ChangeEvent } from "react";
import { useState } from "react";
import { getApiErrorMessage } from "#/core/helpers/error-handler.helper";
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
		} catch (err) {
			// Presign errors carry the API's message; storage failures (CORS, bad
			// signature) only show up here, so keep the real cause in the console.
			console.error(`[upload:${folder}]`, err);
			setUploadError(
				getApiErrorMessage(err) ?? "Upload failed. Please try again.",
			);
		} finally {
			setIsUploading(false);
		}
	};

	return { isUploading, uploadError, handleFileChange };
};
