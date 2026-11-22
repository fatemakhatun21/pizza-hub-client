"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { apiFetch, readApiError } from "@/lib/api";

export default function ImageUpload({ value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Only JPG, PNG and WebP images are allowed.");
            toast.error("Only JPG, PNG and WebP images are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5MB.");
            toast.error("Image must be smaller than 5MB.");
            return;
        }

        setUploading(true);
        onChange("");

        try {
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

            onChange(data.url);
            toast.success("Image uploaded successfully.");
        } catch (err) {
            setError(err.message || "Image upload failed.");
            toast.error(err.message || "Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block font-semibold">
                Pizza Image
            </label>

            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={uploading}
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

            {value && (
                <div className="space-y-2">
                    <img
                        src={value}
                        alt="Pizza preview"
                        className="h-40 w-full rounded-xl object-cover"
                    />
                    <p className="text-sm text-green-600">
                        Image uploaded successfully!
                    </p>
                </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <ImagePlus size={15} />
                JPG, PNG or WebP — maximum 5MB
            </div>
        </div>
    );
}
