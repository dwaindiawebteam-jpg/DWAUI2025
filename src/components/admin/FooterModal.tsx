"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onClose: () => void;
}

interface FooterContent {
  instagram: string;
  linkedin: string;
  email: string;
  refundPolicyUrl: string;
  privacyPolicyUrl: string;
}

export default function FooterModal({ onClose }: Props) {
  const { user } = useAuth();

  const [content, setContent] = useState<FooterContent>({
    instagram: "",
    linkedin: "",
    email: "",
    refundPolicyUrl: "",
    privacyPolicyUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from Firebase
  useEffect(() => {
    async function load() {
      if (!user) return;

      const ref = doc(db, "siteContent", "footer");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setContent(snap.data() as FooterContent);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const ref = doc(db, "siteContent", "footer");

      await setDoc(ref, {
        ...content,
        updatedAt: new Date(),
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Footer</h2>

        <div className="space-y-4">
          <input
            placeholder="Instagram URL"
            value={content.instagram}
            onChange={(e) =>
              setContent({ ...content, instagram: e.target.value })
            }
            className="w-full border px-4 py-2"
          />

          <input
            placeholder="LinkedIn URL"
            value={content.linkedin}
            onChange={(e) =>
              setContent({ ...content, linkedin: e.target.value })
            }
            className="w-full border px-4 py-2"
          />

          <input
            placeholder="Email"
            value={content.email}
            onChange={(e) =>
              setContent({ ...content, email: e.target.value })
            }
            className="w-full border px-4 py-2"
          />

          <input
            placeholder="Refund Policy URL"
            value={content.refundPolicyUrl}
            onChange={(e) =>
              setContent({ ...content, refundPolicyUrl: e.target.value })
            }
            className="w-full border px-4 py-2"
          />

          <input
            placeholder="Privacy Policy URL"
            value={content.privacyPolicyUrl}
            onChange={(e) =>
              setContent({ ...content, privacyPolicyUrl: e.target.value })
            }
            className="w-full border px-4 py-2"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#004265] text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}