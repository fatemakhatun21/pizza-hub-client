"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { apiFetch, readApiError } from "@/lib/api";

const MAX_IMAGES = 5;

export default function ImageUpload({
    value,
    onChange,
    multiple = false,
    max = MAX_IMAGES,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const selectedImages = Array.isArray(value)
        ? value.filter(Boolean)
        : value
          ? [value]
          : [];

    const emit = (nextImages) => {
        onChange(multiple ? nextImages : nextImages[0] || "");
    };

    const handleUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = "";

        if (!files.length) return;

        const allowed = files.filter((file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        );
        const oversized = files.filter(
            (file) => file.size > 5 * 1024 * 1024
        );

        setError("");

        if (allowed.length !== files.length) {
            const message = "Only JPG, PNG and WebP images are allowed.";
            setError(message);
            toast.error(message);
            return;
        }

        if (oversized.length) {
            const message = "Each image must be smaller than 5MB.";
            setError(message);
            toast.error(message);
            return;
        }

        if (selectedImages.length + files.length > max) {
            const message = `You can upload at most ${max} images.`;
            setError(message);
            toast.error(message);
            return;
        }

        setUploading(true);

        try {
            const uploaded = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append("image", file);

                const response = await apiFetch("/api/uploads/image", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(
                        await readApiError(response, "Image upload failed.")
                    );
                }

                const data = await response.json();

                if (!data.url) {
                    throw new Error("Image URL was not returned.");
                }

                uploaded.push(data.url);
            }

            emit([...selectedImages, ...uploaded]);
            toast.success(
                uploaded.length === 1
                    ? "Image uploaded successfully."
                    : `${uploaded.length} images uploaded successfully.`
            );
        } catch (err) {
            setError(err.message || "Image upload failed.");
            toast.error(err.message || "Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (index) => {
        emit(selectedImages.filter((_, itemIndex) => itemIndex !== index));
    };

    return (
        <div className="space-y-3">
            <label className="block font-semibold">
                Pizza Images{multiple ? " (up to 5)" : ""}
            </label>

            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={multiple}
                onChange={handleUpload}
                disabled={uploading || selectedImages.length >= max}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm"
            />

            {uploading && (
                <p className="flex items-center gap-2 text-sm text-[#C93425]">
                    <Loader2 size={17} className="animate-spin" />
                    Uploading image...
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {selectedImages.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {selectedImages.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative overflow-hidden rounded-xl border border-gray-200"
                        >
                            <Image
                                src={src}
                                alt={`Pizza preview ${index + 1}`}
                                width={400}
                                height={240}
                                unoptimized
                                className="h-36 w-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                aria-label={`Remove image ${index + 1}`}
                                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-gray-700 shadow-sm hover:text-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <ImagePlus size={15} />
                JPG, PNG or WebP — maximum 5MB each. The first image is used as the
                card thumbnail.
            </div>
        </div>
    );
}
