"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { X } from "lucide-react";

import { validateArticle } from "@/lib/articles/validateArticle";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";
import { findUnusedAssets } from "@/lib/articles/findUnusedAssets";

import CoverUpload from "@/components/articles/CoverUpload";
import ArticleEditor from "@/components/articles/ArticleEditor";
import FloatingAutosaveIndicator from "@/components/editor/FloatingAutosaveIndicator";
import FloatingSaveBar from "@/components/editor/FloatingSaveBar";
import { useRouter } from "next/navigation";
import { sanitizeSlug } from "@/lib/articles/sanitizeSlug";
import { debugFirestoreError } from "@/lib/firebase/debugFirestoreError";

type ArticleEditorPageProps = {
  articleId?: string;
  mode: "new" | "edit";
};

const BACKUP_AUTOSAVE_INTERVAL = 10 * 60 * 1000;
const DEFAULT_COVER_POSITION = { x: 50, y: 50 };

const getActiveArticleIdKey = (uid: string) => `active-article-id:${uid}`;
const getAutosaveKey = (uid: string, articleId: string) => `article-draft:${uid}:${articleId}`;

export default function ArticleEditorPage({ articleId, mode }: ArticleEditorPageProps) {
  
  const { user: currentAuthUser, authReady, role } = useAuth();
  const isAdmin = role === "admin";
  
  // Refs
  const articleIdRef = useRef<string | null>(null);
  const articleAuthorIdRef = useRef<string | null>(null);
  
  const isAdminOversight =
  isAdmin &&
  articleAuthorIdRef.current &&
  articleAuthorIdRef.current !== currentAuthUser?.uid;

  const hasSavedOnceRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const shouldSkipLocalDrafts = useRef(false);
  const serverSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const authorSnapshotRef = useRef<{
    authorName: string;
    authorInitials: string;
  } | null>(null);

  // State
  const [articleData, setArticleData] = useState({
    title: "",
    slug: "",
    metaDescription: "",
    coverImage: null as { url: string; fileId: string } | null,
    coverImageAlt: "",
    coverImagePosition: DEFAULT_COVER_POSITION,
    body: null as any,
    tags: [] as string[],
    status: "draft" as "draft" | "published",
  });
  
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  const [resetEditorToken, setResetEditorToken] = useState(0);
  const [pageReady, setPageReady] = useState(false);
  const [articleReady, setArticleReady] = useState(false);
  const [articleIdState, setArticleIdState] = useState<string | null>(null);

  // Autosave UI State
  const [autosaving, setAutosaving] = useState(false);
  const [lastLocalSave, setLastLocalSave] = useState<number | null>(null);
  const [lastServerSave, setLastServerSave] = useState<number | null>(null);
  const [nextServerSaveAt, setNextServerSaveAt] = useState<number | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const [now, setNow] = useState(Date.now());
  

const prevUserIdRef = useRef<string | null>(null);
const prevArticleIdRef = useRef<string | null>(null);
const slugManuallyEditedRef = useRef(false);

  const articleDataRef = useRef(articleData);
  const router = useRouter();

  // Destructure for easier access
  const { title, slug, metaDescription, coverImage, coverImageAlt, body, tags, status } = articleData;

  const updateArticleData = useCallback((updates: Partial<typeof articleData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  }, []);

const resolveAuthorId = () => {
  // Admin editing someone else's article → preserve original author
  if (isAdmin && articleAuthorIdRef.current) {
    return articleAuthorIdRef.current;
  }

  // Otherwise → current user
  return currentAuthUser!.uid;
};


  const clearEditorState = useCallback(() => {
  hasRestoredRef.current = false;
  hasSavedOnceRef.current = false;
  shouldSkipLocalDrafts.current = false;

  setArticleData({
    title: "",
    slug: "",
    metaDescription: "",
    coverImage: null,
    coverImageAlt: "",
    coverImagePosition: DEFAULT_COVER_POSITION,
    body: null,
    tags: [],
    status: "draft",
  });

  setUploadedAssets([]);
  setErrors({});
  setAutosaving(false);
  setLastLocalSave(null);
  setLastServerSave(null);

  // forces ArticleEditor remount
  setResetEditorToken(v => v + 1);
}, []);



  // Update ref when articleData changes
  useEffect(() => {
    articleDataRef.current = articleData;
  }, [articleData]);

  // Page initialization
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Clear alt text when cover image is removed
  useEffect(() => {
    if (!coverImage) {
      updateArticleData({ coverImageAlt: "" });
    }
  }, [coverImage, updateArticleData]);

  // Initialize article ID
  useEffect(() => {
    if (!currentAuthUser) return;

    const uid = currentAuthUser.uid;

   if (mode === "edit" && articleId) {
  articleIdRef.current = articleId;
  setArticleIdState(articleId);

  (async () => {
    try {
      const uid = currentAuthUser!.uid;
      const snap = await getDoc(doc(db, "articles", articleId));

      if (!snap.exists()) {
        return;
      }

      const data = snap.data();

      // Cache author for later (restore + oversight logic)
      articleAuthorIdRef.current = data.authorId ?? null;
      // If admin editing foreign article → never load local drafts
      shouldSkipLocalDrafts.current =
        isAdmin && data.authorId !== currentAuthUser!.uid;


      const isForeignArticle = data.authorId !== uid;

      // Non-admins cannot edit foreign articles
      if (isForeignArticle && !isAdmin) {
        return;
      }

      // Only authors update lastActiveArticleId
      if (!isForeignArticle) {
        await setDoc(
          doc(db, "users", uid),
          { lastActiveArticleId: articleId },
          { merge: true }
        );
      }
    } catch (err) {
    }
  })();

  // Allow editor + restore logic to proceed
  setTimeout(() => {
    setArticleReady(true);
  }, 0);

  return;
}

    const init = async () => {
      const localKey = getActiveArticleIdKey(uid);
      let id = localStorage.getItem(localKey);

      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        const userData = userSnap.data();

        // existing behavior
        const remoteId = userData?.lastActiveArticleId;
        if (remoteId) id = remoteId;

        // STORE AUTHOR SNAPSHOT LOCALLY
        if (userData) {
          authorSnapshotRef.current = {
            authorName: [userData.firstName, userData.lastName].filter(Boolean).join(" "),
            authorInitials: userData.initials ?? "",
          };
        }
      } catch (err) {
      }

      if (!id) {
        id = crypto.randomUUID();
      }

      localStorage.setItem(localKey, id);
      articleIdRef.current = id;
      setArticleIdState(id);

      // Track active article for recovery
      await setDoc(
        doc(db, "users", uid),
        { lastActiveArticleId: id },
        { merge: true }
      );

          setTimeout(() => {
          setArticleReady(true);
        }, 0);
    };

    init();
  }, [currentAuthUser, mode, articleId]);

  // Auto-generate slug
useEffect(() => {
  if (!title) return;
  if (slugManuallyEditedRef.current) return;
  if (mode === "edit") return; // 👈 extra protection

  const newSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  updateArticleData({ slug: newSlug });
}, [title, updateArticleData, mode]);



  // Local autosave
useEffect(() => {
  if (!hasRestoredRef.current || !articleReady || !pageReady || !currentAuthUser) return;

  const articleId = articleIdRef.current;
  if (!articleId) return;

  const timeout = setTimeout(() => {
    if (shouldSkipLocalDrafts.current) {
      return;
    }

    const key = getAutosaveKey(currentAuthUser.uid, articleId);

    const payload = {
      ...articleDataRef.current,
      uploadedAssets,
      savedAt: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(payload));
    setLastLocalSave(Date.now());
  }, 800);

  return () => clearTimeout(timeout);
}, [articleData, uploadedAssets, articleReady, pageReady, currentAuthUser]);


  // Local restore
  useEffect(() => {
    if (!currentAuthUser || !articleReady || !articleIdRef.current) {
      return;
    }
    

    const articleId = articleIdRef.current;
    const uid = currentAuthUser.uid;
    const localKey = getAutosaveKey(uid, articleId);

    const restore = async () => {
      const skipLocal = shouldSkipLocalDrafts.current;

      // NEW mode - only check localStorage
      if (mode === "new") {
        const raw = localStorage.getItem(localKey);
        if (skipLocal) {
        } else {
          // allow existing NEW logic to check local

        if (raw) {
          try {
            const draft = JSON.parse(raw);
            setArticleData({
              title: draft.title ?? "",
              slug: draft.slug ?? "",
              metaDescription: draft.metaDescription ?? "",
              coverImage: draft.coverImage ?? null,
              coverImageAlt: draft.coverImageAlt ?? "",
              coverImagePosition: draft.coverImagePosition ?? DEFAULT_COVER_POSITION,
              body: draft.body ?? null,
              tags: draft.tags ?? [],
              status: "draft",
            });
            slugManuallyEditedRef.current = true;
            setUploadedAssets(draft.uploadedAssets ?? []);
          } catch (err) {
          }
        } else {
          // inside the NEW branch, after local check and if no local found:
        try {
          const snap = await getDoc(doc(db, "articles", articleId));
          if (snap.exists()) {
            const data = snap.data();
            articleAuthorIdRef.current = data.authorId ?? null;

            const isForeignArticle = data.authorId !== currentAuthUser.uid;

          if (isForeignArticle && !isAdmin) {
            return;
          }

          if (isForeignArticle && isAdmin) {
          }

    const remoteHasContent =
      Boolean(data?.title) ||
      Boolean(data?.body) ||
      Boolean(data?.slug) ||
      Boolean(data?.metaDescription) ||
      (Array.isArray(data?.tags) && data.tags.length > 0) ||
      (Array.isArray(data?.uploadedAssets) && data.uploadedAssets.length > 0) ||
      Boolean(data?.coverImage);

    if (remoteHasContent) {
      setArticleData({
        title: data.title ?? "",
        slug: data.slug ?? "",
        metaDescription: data.metaDescription ?? "",
        coverImage: data.coverImage ?? null,
        coverImageAlt: data.coverImageAlt ?? "",
        coverImagePosition: data.coverImagePosition ?? DEFAULT_COVER_POSITION,
        body: data.body ?? null,
        tags: data.tags ?? [],
        status: data.status ?? "draft",
      });
      setUploadedAssets(data.uploadedAssets ?? []);
      slugManuallyEditedRef.current = true;
    }
  }
} catch (err) {
}

        }
        hasRestoredRef.current = true;
        return;
      }
    }
      // EDIT mode - check localStorage first, then Firebase

    // ADMIN OVERSIGHT → Skip ALL local restore
    if (
      isAdmin &&
      articleAuthorIdRef.current &&
      articleAuthorIdRef.current !== currentAuthUser.uid
    ) {
      hasRestoredRef.current = true;
      return;
    }
  
    // Check localStorage first
    const raw = localStorage.getItem(localKey);

      if (raw) {
        try {
          const draft = JSON.parse(raw);
          setArticleData({
            title: draft.title ?? "",
            slug: draft.slug ?? "",
            metaDescription: draft.metaDescription ?? "",
            coverImage: draft.coverImage ?? null,
            coverImageAlt: draft.coverImageAlt ?? "",
            coverImagePosition: draft.coverImagePosition ?? DEFAULT_COVER_POSITION,
            body: draft.body ?? null,
            tags: draft.tags ?? [],
            status: "draft",
          });
          setUploadedAssets(draft.uploadedAssets ?? []);
          hasRestoredRef.current = true;
          return;
        } catch (err) {
        }
        
      } 

      // If no local draft, try Firebase
      try {
        const snap = await getDoc(doc(db, "articles", articleId));
        
        if (snap.exists()) {
          const data = snap.data();
          articleAuthorIdRef.current = data.authorId ?? null;

           // EDGE CASE 1 — ownership validation
        const isForeignArticle = data.authorId !== currentAuthUser.uid;

if (isForeignArticle && !isAdmin) {
  return;
}

if (isForeignArticle && isAdmin) {
}

          // Decide whether remote doc actually contains real content
          const remoteHasContent =
            Boolean(data.title) ||
            Boolean(data.body) ||
            Boolean(data.slug) ||
            Boolean(data.metaDescription) ||
            (Array.isArray(data.tags) && data.tags.length > 0) ||
            (Array.isArray(data.uploadedAssets) && data.uploadedAssets.length > 0) ||
            (data.coverImage && data.coverImage !== null);

          if (remoteHasContent) {
            setArticleData({
              title: data.title ?? "",
              slug: data.slug ?? "",
              metaDescription: data.metaDescription ?? "",
              coverImage: data.coverImage ?? null,
              coverImageAlt: data.coverImageAlt ?? "",
              coverImagePosition: data.coverImagePosition ?? DEFAULT_COVER_POSITION,
              body: data.body ?? null,
              tags: data.tags ?? [],
              status: data.status ?? "draft",
            });
            setUploadedAssets(data.uploadedAssets ?? []);
          }
        }
      } catch (err) {
      }
      
      hasRestoredRef.current = true;
    };

    if (!hasRestoredRef.current) {
      restore();
    }
  }, [currentAuthUser, articleReady, mode, articleIdState]);

const getAuthorPayload = () => {
  if (!authorSnapshotRef.current) return {};
  return {
    authorName: authorSnapshotRef.current.authorName,
    authorInitials: authorSnapshotRef.current.authorInitials,
  };
};

  // Server autosave function
  const autosaveToServer = useCallback(
    async (force = false, awaitConfirm = false) => {

      console.log("🔍 AUTOSAVE TRIGGERED", {
        force,
        articleId: articleIdRef.current,
        hasRestored: hasRestoredRef.current,
        hasUser: !!currentAuthUser,
        articleReady,
        timestamp: new Date().toISOString()
      });
      
      console.log("📦 AUTOSAVE DATA SNAPSHOT:", {
        title: articleDataRef.current.title,
        hasBody: !!articleDataRef.current.body,
        hasCover: !!articleDataRef.current.coverImage,
        status: articleDataRef.current.status
      });

      if (!hasRestoredRef.current || !currentAuthUser || !articleReady) {
        console.log("⏭️ Autosave skipped - prerequisites not met:", {
          hasRestored: hasRestoredRef.current,
          hasUser: !!currentAuthUser,
          articleReady
        });
        return;
      }

      const articleId = articleIdRef.current;
      if (!articleId) {
        console.log("⏭️ Autosave skipped - no article ID");
        return;
      }

      const data = articleDataRef.current;

      console.log("📤 AUTOSAVE PAYLOAD:", {
        title: data.title,
        slug: data.slug,
        hasBody: !!data.body,
        coverImage: data.coverImage?.url,
        tags: data.tags,
        status: data.status
      });

      console.log("🔑 AUTOSAVE AUTHOR ID:", resolveAuthorId());
      console.log("👤 CURRENT USER UID:", currentAuthUser.uid);

      if (!force && !data.title && !data.body && !data.coverImage) {
        console.log("⏭️ Autosave skipped - empty content (not forced)");
        return;
      }

      setAutosaving(true);

      const articleRef = doc(db, "articles", articleId);

      const cleanSlug = sanitizeSlug(articleData.slug);

      // 🔒 Prevent resurrection
      console.log("🔍 Checking if article exists in Firestore...");
      const existingSnap = await getDoc(articleRef);
      
      console.log("🔥 DOES DOC EXIST:", existingSnap.exists());
console.log("🔥 EXISTING SNAP DATA:", existingSnap.data());
      console.log("📄 Article exists in Firestore:", existingSnap.exists());

      if (!existingSnap.exists()) {
  console.log("🆕 Creating article before first autosave...");

  await setDoc(articleRef, {
    authorId: resolveAuthorId(),
    title: data.title || "",
    slug: data.slug || "",
    status: data.status || "draft",
    createdAt: new Date(),
    ...getAuthorPayload(),
  });

  console.log("✅ Article created. Autosave can proceed.");
}
        
      console.log("✅ Article exists, proceeding with autosave...");

      try {
        console.log("📝 Writing to Firestore...");

        const token = await currentAuthUser.getIdTokenResult();

        console.log("🔑 AUTOSAVE TOKEN", {
          uid: currentAuthUser.uid,
          role: token.claims.role,
          claims: token.claims
        });

        console.log("📄 FIRESTORE PATH:", articleRef.path);

        console.log("📦 FIRESTORE PAYLOAD:", {
        title: data.title,
        slug: cleanSlug,
        status: data.status,
        authorId: resolveAuthorId(),
        autosaved: true
      });
        await setDoc(
          articleRef,
          {
            ...data,
            authorId: resolveAuthorId(),
            ...getAuthorPayload(),
            updatedAt: new Date(),
            autosaved: true,
          },
          { merge: true }
        );

        console.log("✅ Autosave write successful");

        const key = getAutosaveKey(currentAuthUser.uid, articleId);
        localStorage.removeItem(key);
        console.log("🗑️ Local draft cleared");

        // Optional confirmation read (used by preview)
        if (awaitConfirm) {
          console.log("🔍 Performing confirmation read...");
          await getDoc(articleRef);
          console.log("✅ Confirmation read complete");
        }

        setLastServerSave(Date.now());
        console.log("💾 Last server save timestamp updated");
      } catch (err: any) {
       debugFirestoreError(err, "AUTOSAVE");
        throw err;
      } finally {
        setAutosaving(false);
        console.log("🏁 Autosave completed (with potential error)");
      }
    },
    [currentAuthUser, articleReady]
  );

  // Periodic backup autosave
  useEffect(() => {
    if (!currentAuthUser) return;

    setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);

    backupIntervalRef.current = setInterval(async () => {
    const articleId = articleIdRef.current;
    if (!articleId) return;

    const snap = await getDoc(doc(db, "articles", articleId));
    if (!snap.exists()) {
      clearInterval(backupIntervalRef.current!);
      return;
    }

    autosaveToServer();

      setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);
    }, BACKUP_AUTOSAVE_INTERVAL);

    return () => {
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
      setNextServerSaveAt(null);
    };
  }, [currentAuthUser, autosaveToServer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

useEffect(() => {
  if (!currentAuthUser) return;

  const currentUid = currentAuthUser.uid;

  if (
    prevUserIdRef.current &&
    prevUserIdRef.current !== currentUid
  ) {
    authorSnapshotRef.current = null;
    clearEditorState();

    articleIdRef.current = null;
    setArticleIdState(null);
    setArticleReady(false);
  }

  prevUserIdRef.current = currentUid;
}, [currentAuthUser?.uid, clearEditorState]);


  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    
    e.preventDefault();
    let value = e.currentTarget.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    if (!value || tags.includes(value)) return;
    
    updateArticleData({ tags: [...tags, value] });
    e.currentTarget.value = "";
  };

  const handleRemoveTag = (tag: string) => {
    updateArticleData({ tags: tags.filter(t => t !== tag) });
  };

  const handlePreview = async () => {
    if (!articleIdRef.current) return;

    const missing = [];
    if (!title.trim()) missing.push("Title");
    if (!slug.trim()) missing.push("Slug");
    if (!body) missing.push("Content");

    if (missing.length > 0) {
      alert(`You need to fill in:\n- ${missing.join("\n- ")}`);
      return;
    }

    try {
      // FORCE save + CONFIRM
      await autosaveToServer(true, true);

      window.open(
        `/author/articles/preview/${articleIdRef.current}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      alert("Preview failed — could not save article.");
    }
  };

  const resetForm = useCallback(() => {
    hasRestoredRef.current = false;
    setArticleReady(false);
    
    setArticleData({
      title: "",
      slug: "",
      metaDescription: "",
      coverImage: null,
      coverImageAlt: "",
      coverImagePosition: DEFAULT_COVER_POSITION,
      body: null,
      tags: [],
      status: "draft",
    });

    setUploadedAssets([]);
    setResetEditorToken(v => v + 1);
    hasSavedOnceRef.current = false;

    if (currentAuthUser) {
      const newId = crypto.randomUUID();
     articleIdRef.current = newId;
      setArticleIdState(newId);
      localStorage.setItem(getActiveArticleIdKey(currentAuthUser.uid), newId);
    }

    setArticleReady(true);
  }, [currentAuthUser]);

  
  
  const handleSave = async () => {
    console.log("=".repeat(80));
    console.log("🚀 SAVE BUTTON CLICKED", {
      articleId: articleIdRef.current,
      uid: currentAuthUser?.uid,
      role,
      mode,
      timestamp: new Date().toISOString()
    });
    console.log("=".repeat(80));
    
    if (!articleIdRef.current) {
      console.error("❌ Save failed: No article ID");
      setErrors({ general: "Article ID not ready yet." });
      return;
    }

    if (!currentAuthUser) {
      console.error("❌ Save failed: No authenticated user");
      setErrors({ general: "Please log in to save changes." });
      return;
    }

    console.log("📋 Current article data:", {
      title: articleData.title,
      slug: articleData.slug,
      hasBody: !!articleData.body,
      coverImage: articleData.coverImage?.url,
      tags: articleData.tags,
      status: articleData.status
    });

    // 🔁 Force latest autosave before final commit (same behavior as preview)
    try {
      console.log("🔄 Running forced autosave before final save...");
      await autosaveToServer(true, true);
      console.log("✅ Autosave completed successfully");
    } catch (err) {
      console.error("❌ Autosave failed:", err);
      setErrors({ general: "Could not prepare article for save." });
      return;
    }

    setErrors({});
    setSaving(true);
    setSuccessMessage("");

    const validation = validateArticle(articleData);
    console.log("🔍 Validation result:", validation);

    if (validation) {
      console.log("❌ Validation failed:", validation);
      setErrors(validation);
      setSaving(false);
      return;
    }

    console.log("✅ Validation passed");

    try {
      /**
       * Ensure latest custom claims are loaded.
       */
      const ensureFreshRoleClaim = async () => {
        try {
          await currentAuthUser.reload();
        } catch (e) {
          console.warn("⚠️ Failed to reload user:", e);
        }

        const idResult = await currentAuthUser.getIdTokenResult(true);
        return idResult?.claims?.role;
      };

      console.log("🔑 Checking user permissions...");
      let roleClaim = await ensureFreshRoleClaim();
      console.log("📜 Role claim from token:", roleClaim);
      
      const fullToken = await currentAuthUser.getIdTokenResult(true);
      console.log("📜 FULL TOKEN CLAIMS:", fullToken.claims);
      console.log("👤 AUTH UID:", currentAuthUser.uid);
      console.log("👤 ROLE FROM CONTEXT:", role);

      if (roleClaim !== "admin" && roleClaim !== "author") {
        roleClaim = await ensureFreshRoleClaim();
        if (roleClaim !== "admin" && roleClaim !== "author") {
          throw new Error("Insufficient permissions. Admin or author role required.");
        }
      }

      console.log("✅ Permission check passed");

      // ---------- PREPARE SAVE DATA ----------
      let unusedAssets: string[] = [];

      if (body && typeof body === "object") {
        const usedAssets = extractArticleAssets(
          { coverImage, body },
          uploadedAssets
        );
        unusedAssets = findUnusedAssets(uploadedAssets, usedAssets);
        console.log("📦 Asset analysis:", {
          uploaded: uploadedAssets.length,
          used: usedAssets.length,
          unused: unusedAssets.length
        });
      }

      const articleRef = doc(db, "articles", articleIdRef.current!);
      console.log("📄 Article Firestore path:", articleRef.path);
      
      console.log("🔍 Fetching existing article...");
      const snap = await getDoc(articleRef);
      const existing = snap.exists() ? snap.data() : null;
      
      console.log("📄 Existing article:", existing ? {
        id: articleIdRef.current,
        hasData: true,
        authorId: existing.authorId,
        createdAt: existing.createdAt
      } : "No existing document");

      const writePayload = async () => {
        const snap = await getDoc(articleRef);

        const payload = {
          title: articleData.title,
          slug: sanitizeSlug(articleData.slug),
          metaDescription: articleData.metaDescription,
          coverImage: articleData.coverImage,
          coverImageAlt: articleData.coverImageAlt,
          coverImagePosition: articleData.coverImagePosition,
          body: articleData.body,
          tags: articleData.tags,
          status: articleData.status,
          authorId: resolveAuthorId(),
          ...getAuthorPayload(),
          updatedAt: serverTimestamp(),
          ...(articleData.status === "published" && !snap.data()?.publishedAt && {
            publishedAt: serverTimestamp(),
          }),
        };

        console.log("📦 Final save payload:", {
          title: payload.title,
          slug: payload.slug,
          metaDescription: payload.metaDescription?.substring(0, 50) + "...",
          hasCoverImage: !!payload.coverImage,
          coverImageAlt: payload.coverImageAlt,
          coverImagePosition: payload.coverImagePosition,
          hasBody: !!payload.body,
          tags: payload.tags,
          status: payload.status,
          authorId: payload.authorId,
          authorName: payload.authorName,
          hasAuthorInitials: !!payload.authorInitials,
          hasUpdatedAt: !!payload.updatedAt,
          hasPublishedAt: !!payload.publishedAt
        });

        console.log("🔑 Resolved authorId:", resolveAuthorId());
        console.log("👤 Current user UID:", currentAuthUser.uid);
        console.log("📄 Existing article:", snap.data());

        const allowedKeys = [
          "title",
          "slug",
          "metaDescription",
          "coverImage",
          "coverImageAlt",
          "coverImagePosition",
          "body",
          "tags",
          "status",
          "authorId",
          "authorName",
          "authorInitials",
          "updatedAt",
          "createdAt",
          "publishedAt",
          "autosaved"
        ];

        const payloadKeys = Object.keys(payload);
        const invalidKeys = payloadKeys.filter(k => !allowedKeys.includes(k));

        if (invalidKeys.length > 0) {
          console.warn("⚠️ Payload contains potentially invalid keys:", invalidKeys);
        }

        if (!snap.exists()) {
          // FIRST SAVE → CREATE DOC
          console.log("📝 Creating new article document...");

          const token = await currentAuthUser.getIdTokenResult();

          console.log("🔑 TOKEN DEBUG", {
            uid: currentAuthUser.uid,
            role: token.claims.role,
            claims: token.claims
          });
          await setDoc(articleRef, {
            ...payload,
            createdAt: serverTimestamp(),
          });
          console.log("✅ Article created successfully");
        } else {
          // SUBSEQUENT SAVES → UPDATE DOC
          console.log("📝 Updating existing article document...");
          await updateDoc(articleRef, payload);
          console.log("✅ Article updated successfully");
        }
      };
      
      // ---------- ATTEMPT SAVE ----------
      try {
        console.log("📤 Attempting Firestore write...");
        await writePayload();
        console.log("✅ Firestore write succeeded");
      } catch (err: any) {
        console.error("❌ Firestore write failed:", err);
        console.error("❌ Error code:", err?.code);
        console.error("❌ Error message:", err?.message);
        console.error("❌ Error stack:", err?.stack);
        
        if (err?.code === "permission-denied") {
          console.log("🔄 Permission denied - refreshing token and retrying...");
          await currentAuthUser.reload();
          await ensureFreshRoleClaim();
          console.log("🔄 Retrying write...");
          await writePayload(); // retry once
          console.log("✅ Retry succeeded");
        } else {
          throw err;
        }
      }

      console.log("✅ Save completed successfully");

      // ---------- USER CLEANUP ----------
      await setDoc(
        doc(db, "users", currentAuthUser.uid),
        { lastActiveArticleId: null },
        { merge: true }
      );

      const shouldCleanup = hasSavedOnceRef.current;
      if (!hasSavedOnceRef.current) {
        hasSavedOnceRef.current = true;
      }

      if (shouldCleanup && uploadedAssets.length > 0 && unusedAssets.length > 0) {
        if (unusedAssets.length !== uploadedAssets.length) {
          console.log("🧹 Cleaning up unused assets:", unusedAssets.length);
          await Promise.all(
            unusedAssets.map(async (url) => {
              try {
                await fetch("/api/delete-asset", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url }),
                });
                console.log(`✅ Deleted unused asset: ${url}`);
              } catch (err) {
                console.error(`❌ Failed to delete asset ${url}:`, err);
              }
            })
          );
        }
      }

      setSuccessMessage(
        hasSavedOnceRef.current
          ? "Article updated successfully!"
          : "Article created successfully!"
      );

      setShowSuccessPanel(true);

      if (currentAuthUser && articleIdRef.current) {
        localStorage.removeItem(
          getAutosaveKey(currentAuthUser.uid, articleIdRef.current)
        );
        localStorage.removeItem(
          getActiveArticleIdKey(currentAuthUser.uid)
        );
        console.log("🗑️ Local storage cleared");
      }

      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
        serverSaveTimeoutRef.current = null;
      }

      resetForm();
      setAutosaving(false);
      setLastLocalSave(null);
      setLastServerSave(null);

      setTimeout(() => setSuccessMessage(""), 2500);

    } catch (err: any) {
      console.error("❌ Save process failed catastrophically:", {
        error: err,
        code: err?.code,
        message: err?.message,
        stack: err?.stack
      });
      setErrors({ general: err.message || "Failed to save article." });
    } finally {
      setSaving(false);
      console.log("🏁 Save process completed (with potential error)");
    }
  };

  const timeUntilNextSave = nextServerSaveAt ? Math.max(0, nextServerSaveAt - now) : null;

  // Loading states
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] overflow-hidden">
          <div className="h-full w-full bg-[#004265] animate-pulse"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans!">
          Loading editor…
        </p>
      </div>
    );
  }

  if (role !== "admin" && role !== "author") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold  mb-4 font-sans!">
            Access Denied
          </h1>
          <p className=" font-sans!">
            Log in as author to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold  mb-6 text-center font-sans!">
          {mode === "edit" ? "Edit Article" : "Create New Article"}
        </h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 ">
            {successMessage}
          </div>
        )}

        {showSuccessPanel && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white shadow-lg p-6 w-[90%] max-w-md text-center">
              <h2 className="text-2xl font-bold  mb-4 font-sans!">
                Saved Successfully
              </h2>
              <p className=" mb-6 font-sans!">
                Your article has been saved. What would you like to do next?
              </p>

              <div className="flex flex-col gap-3">
                <button
                onClick={() => {
                  setShowSuccessPanel(false);
                  window.location.href = isAdminOversight
                    ? "/admin/articles"
                    : "/author/articles";
                }}
                className="w-full py-3 bg-[#004265] text-white cursor-pointer transition font-sans!"
              >
                {isAdminOversight ? "Go to All Articles" : "Go to My Articles"}
              </button>


                <button
                  onClick={() => setShowSuccessPanel(false)}
                  className="w-full py-3 border cursor-pointer hover:bg-[#BFDBFE] transition font-sans!"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 ">
            {errors.general}
          </div>
        )}

        <div className="border border-[#D8CDBE]  shadow-md p-6 sm:p-8 mb-4">
          <h2 className="text-2xl font-medium mb-4 font-sans!">
            Article Details
          </h2>

          <div className="space-y-8">
            {/* Title */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold mb-3 font-sans!">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3  border-2 border-[#004265]"
                value={title}
                onChange={(e) => updateArticleData({ title: e.target.value })}
                placeholder="Enter article title"
              />
              {errors.title && <p className="mt-2 text-red-600 font-medium">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold  mb-3 font-sans!">
                Slug (URL)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3  border-2 border-[#004265]"
                value={slug}
                onChange={(e) => {
                    slugManuallyEditedRef.current = true;
                    updateArticleData({ slug: e.target.value });
                  }}
                  onBlur={() => {
                updateArticleData({ slug: sanitizeSlug(slug) });
              }}
                placeholder="Article URL slug"
              />
              {errors.slug && <p className="mt-2 text-red-600 font-medium">{errors.slug}</p>}
            </div>

            {/* Meta Description */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold  mb-3 font-sans!">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => updateArticleData({ metaDescription: e.target.value })}
                maxLength={160}
                rows={3}
                placeholder="Short summary shown in search results (150–160 chars)"
                className="w-full px-4 py-3  border-2 border-[#004265] scrollable-description"
                style={{ resize: "none" }} // optional but recommended
              />

              <p className="mt-1 text-sm! text-gray-600 font-sans!">
                {metaDescription.length}/160 characters
              </p>
              {errors.metaDescription && (
                <p className="mt-2 text-red-600 font-medium">{errors.metaDescription}</p>
              )}
            </div>

            {/* Cover Image */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold  mb-3 font-sans!">
                Cover Image
              </label>
            {articleReady && articleIdRef.current && (
            <CoverUpload
              value={coverImage}
              articleId={articleIdRef.current}
              position={articleData.coverImagePosition}
              onPositionChange={(pos) => updateArticleData({ coverImagePosition: pos })}
              onChange={(file) => {
                updateArticleData({ coverImage: file });

                if (file) {
                  setUploadedAssets(prev =>
                    prev.includes(file.url) ? prev : [...prev, file.url]
                  );
                }
              }}
            />
          )}

              <div className="mt-4">
                <label className="block text-sm font-semibold  mb-1">
                  Cover Image Alt Text
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => updateArticleData({ coverImageAlt: e.target.value })}
                  placeholder="Describe the image for accessibility & SEO"
                  disabled={!coverImage}
                  className={`w-full px-4 py-2  border-2 ${
                    coverImage
                      ? "border-[#004265]"
                      : "border-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
                />
                {errors.coverImageAlt && (
                  <p className="mt-1 text-red-600 font-medium">{errors.coverImageAlt}</p>
                )}
              </div>
            </div>

            {/* Body Editor */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-bold  font-sans!">
                  Article Content
                </label>
                <button
                  type="button"
                  disabled={autosaving}
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#004265] text-white cursor-pointer transition font-sans!"
                  title="Preview article"
                >
                  {autosaving ? "Saving…" : "Preview"}
                </button>
              </div>
              {articleReady && articleIdRef.current && (
                <ArticleEditor
                  key={`${currentAuthUser?.uid}:${articleIdRef.current}`}
                  articleId={articleIdRef.current}
                  value={body}
                  onChange={(newBody) => updateArticleData({ body: newBody })}
                  resetToken={resetEditorToken}
                  onImageUploaded={(url) =>
                    setUploadedAssets(prev => prev.includes(url) ? prev : [...prev, url])
                  }
                  title={title}
                  metaDescription={metaDescription}
                  coverImage={coverImage}
                  coverImageAlt={coverImageAlt}
                />
              )}
              {errors.body && <p className="mt-2 text-red-600 font-medium">{errors.body}</p>}
            </div>

            {/* Tags */}
        <div className="bg-white  border border-[#BFDBFE] p-5 shadow-md">
        <label className="block text-lg font-bold mb-3 font-sans!">
          Tags
        </label>
        <input
          type="text"
          placeholder="Type a tag and press Enter"
          onKeyDown={handleAddTag}
          className="w-full px-4 py-3 border-2 border-[#004265]"
        />
        <div className="flex gap-2 flex-wrap mt-3">
          {tags.map((t) => (
            <span
              key={t}
              className="px-4 py-1.5 bg-[#BFDBFE] border rounded-full border-[#BFDBFE]  flex items-center gap-2"
            >
              #{t}
              <button
                onClick={() => handleRemoveTag(t)}
                className="p-1  hover:bg-[#BFDBFE]"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

          {errors.tags && <p className="mt-2 text-red-600 font-medium">{errors.tags}</p>}
        </div>
            {/* Status */}
            <div className="bg-white  border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold  mb-3 font-sans!">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => updateArticleData({ status: e.target.value as "draft" | "published" })}
                className="w-full px-4 py-3  border-2 border-[#004265]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <FloatingSaveBar
          onClick={handleSave}
          saving={saving}
          label="Save Article"
          onDockChange={setIsDocked}
        >
          <FloatingAutosaveIndicator
            autosaving={autosaving}
            lastLocalSave={lastLocalSave}
            lastServerSave={lastServerSave}
            timeUntilNextSave={timeUntilNextSave}
            docked={isDocked}
          />
        </FloatingSaveBar>
      </div>
    </div>
  );
}