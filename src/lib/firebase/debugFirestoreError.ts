export function debugFirestoreError(err: any, context: string) {
  console.group(`🔥 Firestore Error [${context}]`);

  console.log("code:", err?.code);
  console.log("message:", err?.message);

  if (err?.customData) {
    console.log("customData:", err.customData);
  }

  if (err?.toJSON) {
    console.log("full:", err.toJSON());
  }

  console.log("raw:", err);

  console.groupEnd();
}