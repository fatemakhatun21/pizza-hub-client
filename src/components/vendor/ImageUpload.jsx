"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

export default function ImageUpload({ value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");

        if (!file.type.startsWith("image/")) {
            setError("Please select an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5MB.");
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

        if (!apiKey) {
            setError("ImgBB API key is missing.");
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success || !data.data?.url) {
                throw new Error("Image upload failed.");
            }

            onChange(data.data.url);
        } catch (err) {
            setError(err.message || "Image upload failed.");
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
                accept="image/*"
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

                    <p className="text-xs text-green-600">
                        Image ready
                    </p>
                </div>
            )}

            <input type="hidden" value={value || ""} readOnly required />

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <ImagePlus size={15} />
                JPG, PNG or WebP — maximum 5MB
            </div>
        </div>
    );
}
